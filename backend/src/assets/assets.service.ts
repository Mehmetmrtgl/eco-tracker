import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private exchangeRateService: ExchangeRateService,
  ) {}

  // YARDIMCI: Nakit Cüzdanı Bul/Oluştur
  private async findOrCreateDefaultCashAccount(userId: string, prisma: PrismaClient) {
    let cashAccount = await prisma.accounts.findFirst({
      where: { user_id: userId, name: 'Nakit Cüzdanı' },
    });

    if (!cashAccount) {
      cashAccount = await prisma.accounts.create({
        data: {
          user_id: userId,
          name: 'Nakit Cüzdanı',
          type: 'CASH',
          currency: 'TRY',
          balance: new Prisma.Decimal(0),
        },
      });
    }
    return cashAccount;
  }

  // YARDIMCI: Sadece Fiziksel Nakit Cüzdanını Bul/Yarat
  private async findOrCreatePhysicalWallet(userId: string, prisma: PrismaClient) {
    let wallet = await prisma.accounts.findFirst({
      where: { 
          user_id: userId, 
          OR: [{ name: 'Elden Nakit' }, { name: 'Cüzdanım' }] 
      },
    });

    if (!wallet) {
      wallet = await prisma.accounts.create({
        data: {
          user_id: userId,
          name: 'Elden Nakit',
          type: 'CASH',
          currency: 'TRY',
          balance: new Prisma.Decimal(0),
        },
      });
    }
    return wallet;
  }

  // ALIM / SATIM İŞLEMİ
  async create(userId: string, createAssetDto: any) {
    const transactionDate = createAssetDto.date ? new Date(createAssetDto.date) : new Date();
    const quantity = Number(createAssetDto.quantity);
    const ownerName = createAssetDto.owner || "Kendisi";
    const symbol = createAssetDto.symbol;
    
    let unitPrice = Number(createAssetDto.cost || 0);
    if ((createAssetDto.type === 'CASH' || createAssetDto.symbol === 'deposit') && unitPrice === 0) {
        unitPrice = 1; 
    }
    
    const type = createAssetDto.transactionType || 'BUY'; 
    const totalAmount = quantity * unitPrice;
    
    const selectedAccountId = createAssetDto.accountId; 

    return this.prisma.$transaction(async (prisma) => {
      
      // --- A. NAKİT / VADESİZ EKLEME İŞLEMİ ---
      if (createAssetDto.type === 'CASH') {
        let targetAccountId = '';

        if (symbol === 'cash_physical') {
            const wallet = await this.findOrCreatePhysicalWallet(userId, prisma as any);
            targetAccountId = wallet.id;
        } 
        else {
            targetAccountId = createAssetDto.accountId;
            if (!targetAccountId) {
                 const wallet = await this.findOrCreatePhysicalWallet(userId, prisma as any);
                 targetAccountId = wallet.id;
            }
        }

        await prisma.accounts.update({
          where: { id: targetAccountId },
          data: { balance: { increment: new Prisma.Decimal(totalAmount) } },
        });

        return { status: "success", assetId: targetAccountId }; 
      }
      
      // --- B. DİĞER VARLIK İŞLEMLERİ ---
      let cashAccount;
      if (selectedAccountId) {
          cashAccount = await prisma.accounts.findUnique({ where: { id: selectedAccountId } });
      } 
      if (!cashAccount) {
          cashAccount = await this.findOrCreateDefaultCashAccount(userId, prisma as any);
      }
      
      const existingAsset = await prisma.assets.findFirst({
        where: { user_id: userId, symbol: createAssetDto.symbol, owner: ownerName },
      });

      let targetAssetId: string = existingAsset?.id || ''; 

      if (type === 'SELL') {
        if (!existingAsset || Number(existingAsset.quantity) < quantity) throw new BadRequestException('Yetersiz varlık.');
        
        const newTotalQuantity = Number(existingAsset.quantity) - quantity;
        await prisma.assets.update({
          where: { id: existingAsset.id },
          data: { quantity: new Prisma.Decimal(newTotalQuantity), updated_at: new Date() },
        });
        targetAssetId = existingAsset.id;
        
        if (ownerName === "Kendisi") {
            await prisma.accounts.update({
                where: { id: cashAccount.id },
                data: { balance: { increment: new Prisma.Decimal(totalAmount) } },
            });
        }

      } else {
        if (existingAsset) {
          const oldQty = Number(existingAsset.quantity);
          const oldCost = Number(existingAsset.avg_cost);
          const newQty = oldQty + quantity;
          const totalCost = (oldQty * oldCost) + (quantity * unitPrice);
          const newAvgCost = newQty > 0 ? (totalCost / newQty) : 0;

          const updatedAsset = await prisma.assets.update({
            where: { id: existingAsset.id },
            data: { quantity: new Prisma.Decimal(newQty), avg_cost: new Prisma.Decimal(newAvgCost), updated_at: new Date() },
          });
          targetAssetId = updatedAsset.id;
        } else {
          const newAsset = await prisma.assets.create({
            data: { 
                user_id: userId, name: createAssetDto.name, type: createAssetDto.type, 
                symbol: createAssetDto.symbol, owner: ownerName, 
                quantity: new Prisma.Decimal(quantity), avg_cost: new Prisma.Decimal(unitPrice), 
            },
          });
          targetAssetId = newAsset.id;
        }

        if (ownerName === "Kendisi") {
            await prisma.accounts.update({
                where: { id: cashAccount.id },
                data: { balance: { decrement: new Prisma.Decimal(totalAmount) } },
            });
        }
      }
      
      await prisma.asset_transactions.create({
        data: {
          user_id: userId, asset_id: targetAssetId, type: type,
          quantity: new Prisma.Decimal(quantity), price_per_unit: new Prisma.Decimal(unitPrice),
          total_price: new Prisma.Decimal(totalAmount), transaction_date: transactionDate,
        },
      });
      
      return { status: "success", assetId: targetAssetId };
    });
  }

  // 2. LİSTELEME (Hata Düzeltildi)
// 2. Kullanıcının Varlıklarını ve Tüm Hesaplarını Getirme
  async findAll(userId: string) {
    
    // A. Fiziksel Varlıkları (Altın, Döviz vb.) Getir (Miktarı 0'dan büyük olanlar)
    const physicalAssets = await this.prisma.assets.findMany({ 
        where: { user_id: userId, quantity: { gt: 0 } }, 
        orderBy: { updated_at: 'desc' },
    });
    
    // B. TÜM Vadesiz Hesapları Getir (Filtresiz)
    const allCashAccounts = await this.prisma.accounts.findMany({
        where: { user_id: userId, type: 'CASH' },
        orderBy: { created_at: 'asc' }
    });

    // 1. Fiziksel Varlıkları Hesapla
    const assetsWithValues = physicalAssets.map((asset) => {
      let currentPrice = this.exchangeRateService.getLivePrice(asset.symbol);
      
      // Likit varlık koruması (Fiyatı 0 ise 1 kabul et)
      if ((asset.type === 'CASH' || asset.symbol === 'deposit') && currentPrice === 0) {
          currentPrice = 1;
      }

      const totalValue = asset.quantity.toNumber() * currentPrice;

      return {
        ...asset, 
        quantity: asset.quantity.toNumber(),
        avg_cost: asset.avg_cost.toNumber(),
        current_price: currentPrice, 
        total_value: totalValue,    
      };
    });

    const finalResult: any[] = [...assetsWithValues];

    // 2. Tüm Hesapları Listeye Ekle (Sıfır Bakiye Filtresi Uygulanır)
    allCashAccounts.forEach(account => {
        // Hesap bakiyesi (null ise 0, değilse sayıya çevir)
        const balanceValue = account.balance?.toNumber() ?? 0; 
        
        // DÜZELTME: Eğer bakiye mutlak değer olarak 0.01'den (1 kuruş) küçükse gizle
        if (Math.abs(balanceValue) < 0.01) { 
            return; 
        }
        
        // Varlık formatında objeyi oluştur
        const cashAsset: any = { 
            id: account.id, 
            user_id: userId,
            name: account.name,   // Örn: "Halkbank Maaş"
            type: 'CASH', 
            symbol: 'cash_try', 
            quantity: balanceValue,
            avg_cost: 1, 
            current_price: 1,
            total_value: balanceValue, 
            created_at: account.created_at,
            updated_at: account.created_at, 
            owner: 'Kendisi'
        };
        
        finalResult.unshift(cashAsset); // Listenin başına ekle
    });
    
    return finalResult;
  }
  
  async getAssetHistory(userId: string, assetId: string) {
    return this.prisma.asset_transactions.findMany({ 
      where: { user_id: userId, asset_id: assetId }, 
      orderBy: { transaction_date: 'desc' } 
    });
  }

  // ÖZET HESAPLAMA
  async getNetWorthSummary(userId: string) {
    const allAssets = await this.findAll(userId); 

    const totalDebts = await this.prisma.debts.aggregate({
        _sum: { remaining_amount: true },
        where: { user_id: userId, is_closed: false },
    });

    const cardDebts = await this.prisma.credit_cards.aggregate({
        _sum: { current_debt: true },
        where: { user_id: userId },
    });

    const myAssetsValue = allAssets
        .filter(a => a.owner === 'Kendisi' || !a.owner)
        .reduce((sum, asset) => sum + Number(asset.total_value), 0);

    const otherAssetsValue = allAssets
        .filter(a => a.owner && a.owner !== 'Kendisi')
        .reduce((sum, asset) => sum + Number(asset.total_value), 0);

    const totalAssetsValue = myAssetsValue + otherAssetsValue;

    const groupedData: Record<string, number> = {};
    allAssets.forEach((asset) => {
        let label = asset.type;
        if (asset.type === 'GOLD') label = 'Altın';
        else if (asset.type === 'CURRENCY') label = 'Döviz';
        else if (asset.type === 'CASH') label = 'Nakit';
        else if (asset.type === 'STOCK') label = 'Borsa';
        else if (asset.type === 'CRYPTO') label = 'Kripto';
        else label = 'Diğer';
        if (!groupedData[label]) groupedData[label] = 0;
        groupedData[label] += Number(asset.total_value);
    });
    const pieChartData = Object.keys(groupedData).map(key => ({ name: key, value: groupedData[key] })).filter(item => item.value > 0);

    const valNormalDebts = totalDebts._sum.remaining_amount?.toNumber() || 0;
    const valCardDebts = cardDebts._sum.current_debt?.toNumber() || 0;
    const totalDebtsValue = valNormalDebts + valCardDebts;

    const netWorth = myAssetsValue - totalDebtsValue;

    return { 
        totalAssetsValue, myAssetsValue, otherAssetsValue, 
        totalDebtsValue, netWorth, pieChartData 
    };
  }
}