import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, PrismaClient } from '@prisma/client';
import { ExchangeRateService } from '../exchange-rate/exchange-rate.service';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class AssetsService {
  constructor(
    private prisma: PrismaService,
    private exchangeRateService: ExchangeRateService, // Canlı kur servisi
  ) {}

  // YARDIMCI FONKSİYON: Kullanıcının varsayılan Nakit Hesabını Bul/Oluştur
  // Bu, $transaction içinden çağrıldığı için türünü PrismaClient olarak belirliyoruz.
  private async findOrCreateDefaultCashAccount(userId: string, prisma: PrismaClient) {
    let cashAccount = await prisma.accounts.findFirst({
      where: { user_id: userId, name: 'Nakit Cüzdanı' },
    });

    if (!cashAccount) {
      // Eğer yoksa, otomatik olarak oluştur
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

  // ALIM ve SATIM İşlemi (Nakit Akışı dahil)
  async create(userId: string, createAssetDto: any) {
    const transactionDate = createAssetDto.date 
      ? new Date(createAssetDto.date) 
      : new Date();
      
    const quantity = Number(createAssetDto.quantity);
    
    // Nakit (CASH) eklerken 'cost' belirtilmemişse 1 kabul et (Birim Maliyet Fix)
    let unitPrice = Number(createAssetDto.cost || 0);
    if (createAssetDto.type === 'CASH' && unitPrice === 0) {
        unitPrice = 1; 
    }
    
    const type = createAssetDto.transactionType || 'BUY'; 
    const totalAmount = quantity * unitPrice; // Toplam para akışı

    return this.prisma.$transaction(async (prisma) => {
      
      // --- 1. NAKİT EKLEME İŞLEMİ (Sadece Cüzdanı günceller) ---
      if (createAssetDto.type === 'CASH') {
        const cashAccount = await this.findOrCreateDefaultCashAccount(userId, prisma as any);

        await prisma.accounts.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: new Prisma.Decimal(totalAmount) } }, // Bakiye ARTIYOR
        });

        // Diğer Asset tablolarına yazmadan çık
        return { status: "success", assetId: cashAccount.id }; 
      }
      // --- NAKİT EKLEME KONTROLÜ BİTTİ ---

      // 2. Varlık İşlemleri (Altın, Dolar vb.)
      const cashAccount = await this.findOrCreateDefaultCashAccount(userId, prisma as any);
      const existingAsset = await prisma.assets.findFirst({
        where: { user_id: userId, symbol: createAssetDto.symbol },
      });

      let targetAssetId: string = existingAsset?.id || ''; 

      if (type === 'SELL') {
        // --- SATIM MANTIĞI ---
        if (!existingAsset || Number(existingAsset.quantity) < quantity) {
          throw new BadRequestException('Yetersiz varlık. Elindekinden fazlasını satamazsın.');
        }

        const newTotalQuantity = Number(existingAsset.quantity) - quantity;
        const updatedAsset = await prisma.assets.update({
          where: { id: existingAsset.id },
          data: { quantity: new Prisma.Decimal(newTotalQuantity), updated_at: new Date() },
        });
        targetAssetId = updatedAsset.id;
        
        // Cüzdana parayı ekle
        await prisma.accounts.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: new Prisma.Decimal(totalAmount) } }, // SATIM = PARA ARTTI
        });
        
      } else {
        // --- ALIM MANTIĞI ---
        
        if (existingAsset) {
          // Ağırlıklı Ortalama Hesaplama (Update)
          const oldQuantity = Number(existingAsset.quantity);
          const oldAvgCost = Number(existingAsset.avg_cost);
          const totalQuantity = oldQuantity + quantity;
          const totalCost = (oldQuantity * oldAvgCost) + (quantity * unitPrice);
          const newAvgCost = totalQuantity > 0 ? (totalCost / totalQuantity) : 0;
          
          const updatedAsset = await prisma.assets.update({
            where: { id: existingAsset.id },
            data: { 
                quantity: new Prisma.Decimal(totalQuantity), 
                avg_cost: new Prisma.Decimal(newAvgCost), 
                updated_at: new Date() 
            },
          });
          targetAssetId = updatedAsset.id;
        } else {
          // Yeni varlık oluştur (Create)
          const newAsset = await prisma.assets.create({
            data: { user_id: userId, name: createAssetDto.name, type: createAssetDto.type, symbol: createAssetDto.symbol, quantity: new Prisma.Decimal(quantity), avg_cost: new Prisma.Decimal(unitPrice), },
          });
          targetAssetId = newAsset.id;
        }

        // Cüzdandan parayı düş
        await prisma.accounts.update({
          where: { id: cashAccount.id },
          data: { balance: { decrement: new Prisma.Decimal(totalAmount) } }, // ALIM = PARA AZALDI
        });
      }
      
      // 4. İşlemi Tarihçeye Kaydet (Sadece BUY/SELL işlemleri için)
      await prisma.asset_transactions.create({
        data: {
          user_id: userId,
          asset_id: targetAssetId, 
          type: type,
          quantity: new Prisma.Decimal(quantity),
          price_per_unit: new Prisma.Decimal(unitPrice),
          total_price: new Prisma.Decimal(totalAmount),
          transaction_date: transactionDate,
        },
      });
      
      return { status: "success", assetId: targetAssetId };
    });
  }

  // 2. Kullanıcının Varlıklarını Getirme
  async findAll(userId: string) {
    // 1. Varlıkları (Assets) getir: (quantity > 0 filtreli)
    const physicalAssets = await this.prisma.assets.findMany({ 
        where: { user_id: userId, quantity: { gt: 0 } }, 
        orderBy: { updated_at: 'desc' },
    });
    
    // 2. Nakit Cüzdanını (Account) getir:
    const cashAccount = await this.prisma.accounts.findFirst({
        where: { user_id: userId, name: 'Nakit Cüzdanı' },
    });

    // 3. Varlıkların Toplam Değerini Hesapla
    const assetsWithValues = physicalAssets.map((asset) => {
      const currentPrice = this.exchangeRateService.getLivePrice(asset.symbol);
      const totalValue = asset.quantity.toNumber() * currentPrice;

      return {
        ...asset, 
        quantity: asset.quantity.toNumber(),
        avg_cost: asset.avg_cost.toNumber(),
        current_price: currentPrice, 
        total_value: totalValue,    
      };
    });

    const allAssets: any[] = [...assetsWithValues];

    // 4. Nakit Hesabını listeye ekle
    if (cashAccount) {
        // Fix: cashAccount.balance'ın null olmaması gerektiğini garanti ediyoruz
        const isBalanceNotZero = cashAccount.balance!.toNumber() !== 0;

        if (isBalanceNotZero) {
            const balanceValue = cashAccount.balance!.toNumber();
            
            const cashAsset: any = { 
                id: cashAccount.id, 
                user_id: userId,
                name: cashAccount.name, 
                type: cashAccount.type, 
                symbol: 'cash_try', 
                quantity: balanceValue,
                avg_cost: 1, 
                current_price: 1,
                total_value: balanceValue, 
                created_at: cashAccount.created_at,
                updated_at: cashAccount.created_at, 
            };

            allAssets.unshift(cashAsset);
        }
    }
    
    return allAssets;
  }
  
  // 3. Tek Bir Varlığın Geçmişini Getirme
  async getAssetHistory(userId: string, assetId: string) {
    return this.prisma.asset_transactions.findMany({ 
      where: { user_id: userId, asset_id: assetId }, 
      orderBy: { transaction_date: 'desc' } 
    });
  }

  async getNetWorthSummary(userId: string) {
    // 1. Tüm Varlıkları (Assets + Cash) getir
    const allAssets = await this.findAll(userId); 

    // 2. Borçları (Debts) getir
    const totalDebts = await this.prisma.debts.aggregate({
        _sum: { remaining_amount: true },
        where: { user_id: userId, is_closed: false },
    });

    // 3. Toplam Varlık Değerini Hesapla (total_value'ları topluyoruz)
    const totalAssetsValue = allAssets.reduce((sum, asset) => sum + asset.total_value, 0);

    // 4. Net Varlık Hesabı (Varlıklar - Borçlar)
    const totalDebtsValue = totalDebts._sum.remaining_amount?.toNumber() || 0;
    const netWorth = totalAssetsValue - totalDebtsValue;

    return {
        totalAssetsValue, // Toplam Varlık (Brüt)
        totalDebtsValue,  // Toplam Borç
        netWorth,         // Net Durum
    };
  }
}