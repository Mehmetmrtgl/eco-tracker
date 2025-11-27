import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class TransactionsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createDto: any) {
    const amount = Number(createDto.amount);
    const type = createDto.type; // 'INCOME' veya 'EXPENSE'
    const paymentMethod = createDto.paymentMethod; 
    const debtId = createDto.debtId; 
    const date = createDto.date ? new Date(createDto.date) : new Date();
    const categoryName = createDto.category; 

    return this.prisma.$transaction(async (prisma) => {
      
      // 1. KATEGORİ BUL VEYA OLUŞTUR
      // DÜZELTME: Tipini açıkça belirttik (string veya null olabilir)
      let categoryId: string | null = null; 

      if (categoryName) {
        let category = await prisma.categories.findFirst({
            where: { user_id: userId, name: categoryName, type: type }
        });

        if (!category) {
            category = await prisma.categories.create({
                data: {
                    user_id: userId,
                    name: categoryName,
                    type: type,
                    icon: 'default', 
                }
            });
        }
        categoryId = category.id;
      }

      // 2. Nakit Cüzdanını Bul
      let cashAccount = await prisma.accounts.findFirst({
        where: { user_id: userId, name: 'Nakit Cüzdanı' },
      });

      if (!cashAccount) {
        cashAccount = await prisma.accounts.create({
          data: { user_id: userId, name: 'Nakit Cüzdanı', type: 'CASH', balance: 0 },
        });
      }

      // 3. BAKİYE GÜNCELLEMELERİ
      if (type === 'INCOME') {
        await prisma.accounts.update({
          where: { id: cashAccount.id },
          data: { balance: { increment: amount } },
        });
      } else if (type === 'EXPENSE') {
        if (paymentMethod === 'CASH') {
          await prisma.accounts.update({
            where: { id: cashAccount.id },
            data: { balance: { decrement: amount } },
          });
        } 
      }

      // 4. İŞLEMİ KAYDET
      return prisma.transactions.create({
        data: {
          user_id: userId,
          type: type,
          amount: new Prisma.Decimal(amount),
          category_id: categoryId,   
          description: createDto.description,
          transaction_date: date,
          account_id: paymentMethod === 'CASH' ? cashAccount.id : null,
          debt_id: paymentMethod === 'CREDIT_CARD' ? debtId : null,
        },
      });
    });
  }

  // İşlemleri Listeleme
async findAll(userId: string) {
    return this.prisma.transactions.findMany({
      where: { user_id: userId },
      orderBy: [
        { transaction_date: 'desc' }, 
        { created_at: 'desc' }        
      ],
      include: { 
        debts: true,     
        accounts: true,  
        categories: true
      }, 
    });
  }

  // ... (findAll fonksiyonundan sonra) ...

  // ANALİZ VERİSİ GETİRME
 // ANALİZ VERİSİ GETİRME
  // ANALİZ VERİSİ GETİRME (Günlük Trend Eklendi)
// ANALİZ VERİSİ GETİRME
// ANALİZ VERİSİ GETİRME (Filtreli)
// ANALİZ VERİSİ GETİRME (Kıyaslamalı)
  async getAnalysis(userId: string, startDate: Date, endDate: Date, source: string = 'ALL') {
    
    // --- 1. TARİH ARALIĞI VE KIYASLAMA MANTIĞI ---
    // Seçilen aralığın süresini (ms cinsinden) bul
    const duration = endDate.getTime() - startDate.getTime();
    
    // Bir önceki dönemin tarihlerini hesapla
    const prevStartDate = new Date(startDate.getTime() - duration);
    const prevEndDate = new Date(startDate.getTime()); // Bitiş, şimdiki başlangıçtır

    const whereClause: any = { user_id: userId, transaction_date: { gte: startDate, lte: endDate } };
    const prevWhereClause: any = { user_id: userId, transaction_date: { gte: prevStartDate, lte: prevEndDate } };

    // Kaynak filtresi
    if (source === 'CASH') {
        whereClause.debt_id = null;
        prevWhereClause.debt_id = null;
    } else if (source !== 'ALL' && source.length > 10) {
        whereClause.debt_id = source;
        prevWhereClause.debt_id = source;
    }

    // --- 2. VERİLERİ ÇEK ---
    
    // A. Şimdiki Dönem Toplamları
    const totals = await this.prisma.transactions.groupBy({
      by: ['type'], where: whereClause, _sum: { amount: true },
    });

    // B. Geçmiş Dönem Toplamları (Kıyaslama İçin)
    const prevTotals = await this.prisma.transactions.groupBy({
      by: ['type'], where: prevWhereClause, _sum: { amount: true },
    });

    // Değerleri Ayıkla
    const currentIncome = totals.find(t => t.type === 'INCOME')?._sum.amount?.toNumber() || 0;
    const currentExpense = totals.find(t => t.type === 'EXPENSE')?._sum.amount?.toNumber() || 0;
    
    const prevIncome = prevTotals.find(t => t.type === 'INCOME')?._sum.amount?.toNumber() || 0;
    const prevExpense = prevTotals.find(t => t.type === 'EXPENSE')?._sum.amount?.toNumber() || 0;

    // Yüzdelik Değişim Hesapla
    const calculateChange = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? 100 : 0; // Önceki 0 ise ve şimdi varsa %100 artış say
        return ((curr - prev) / prev) * 100;
    };

    const percentages = {
        income: calculateChange(currentIncome, prevIncome),
        expense: calculateChange(currentExpense, prevExpense),
        savings: calculateChange((currentIncome - currentExpense), (prevIncome - prevExpense))
    };

    // --- 3. GRAFİK VERİLERİ (Sadece Şimdiki Dönem İçin) ---
    // (Burası önceki kodla aynı, sadece whereClause kullanıyoruz)
    
    const expensesByCategory = await this.prisma.transactions.groupBy({
      by: ['category_id'],
      where: { ...whereClause, type: 'EXPENSE' },
      _sum: { amount: true },
    });

    const categoryIds = expensesByCategory.map(e => e.category_id).filter(id => id !== null) as string[];
    const categories = await this.prisma.categories.findMany({ where: { id: { in: categoryIds } } });

    const chartData = expensesByCategory.map(item => {
      const cat = categories.find(c => c.id === item.category_id);
      return { name: cat ? cat.name : 'Diğer', value: item._sum.amount?.toNumber() || 0 };
    }).filter(item => item.value > 0 && item.name !== 'KrediKarti').sort((a, b) => b.value - a.value);

    // Ödeme Yöntemi ve Trend
    const allExpenses = await this.prisma.transactions.findMany({
      where: { ...whereClause, type: 'EXPENSE' },
      select: { transaction_date: true, amount: true, debt_id: true }
    });

    let cashTotal = 0;
    let creditCardTotal = 0;
    const dailyMap = new Map<string, number>();

    allExpenses.forEach(tx => {
        const amt = tx.amount.toNumber();
        if (tx.debt_id) creditCardTotal += amt; else cashTotal += amt;
        if (tx.transaction_date) {
            const dayKey = tx.transaction_date.toISOString().split('T')[0];
            dailyMap.set(dayKey, (dailyMap.get(dayKey) || 0) + amt);
        }
    });

    const paymentMethodChart = [
        { name: 'Kredi Kartı', value: creditCardTotal },
        { name: 'Nakit', value: cashTotal }
    ].filter(i => i.value > 0);

    const dailyTrend: { date: string; amount: number }[] = [];
    const today = new Date();
    const effectiveEndDate = endDate > today ? today : endDate;
    let loopDate = new Date(startDate);
    while (loopDate <= effectiveEndDate) {
        const dayKey = loopDate.toISOString().split('T')[0];
        dailyTrend.push({ date: dayKey, amount: dailyMap.get(dayKey) || 0 });
        loopDate.setDate(loopDate.getDate() + 1);
    }

    return {
      totalIncome: currentIncome,
      totalExpense: currentExpense,
      netSavings: currentIncome - currentExpense,
      percentages, // <-- YENİ: Yüzdelik değişimler
      expenseChart: chartData,
      paymentMethodChart,
      dailyTrend,
    };
  }
  // ... (create, findAll, getAnalysis fonksiyonlarından sonra ekle) ...

  // İŞLEM SİLME (Rollback Mantığıyla)
  async remove(id: string, userId: string) {
    return this.prisma.$transaction(async (prisma) => {
      // 1. Silinecek işlemi bul
      const transaction = await prisma.transactions.findFirst({
        where: { id: id, user_id: userId },
      });

      if (!transaction) throw new BadRequestException("İşlem bulunamadı.");

      // 2. Bakiyeyi Geri Al (Ters İşlem)
      if (transaction.account_id) { // Nakit işlemse
        if (transaction.type === 'INCOME') {
          // Gelir siliniyorsa, parayı cüzdandan geri çek
          await prisma.accounts.update({
            where: { id: transaction.account_id },
            data: { balance: { decrement: transaction.amount } },
          });
        } else if (transaction.type === 'EXPENSE') {
          // Gider siliniyorsa, parayı cüzdana iade et
          await prisma.accounts.update({
            where: { id: transaction.account_id },
            data: { balance: { increment: transaction.amount } },
          });
        }
      }
      
      // Not: Kredi Kartı (debt_id) işlemlerinde borç bakiyesini güncellemiyoruz,
      // çünkü kullanıcı borçları manuel yönetiyor demiştik. Sadece kaydı siliyoruz.

      // 3. İşlemi Sil
      return prisma.transactions.delete({ where: { id } });
    });
  }

  async update(id: string, userId: string, updateDto: any) {
    const dataToUpdate: any = {
      description: updateDto.description,
      transaction_date: updateDto.date ? new Date(updateDto.date) : undefined,
    };

    if (updateDto.category) {
      const currentTx = await this.prisma.transactions.findUnique({
        where: { id: id },
        select: { type: true } 
      });

      if (currentTx) {
        let category = await this.prisma.categories.findFirst({
          where: { user_id: userId, name: updateDto.category, type: currentTx.type }
        });

        if (!category) {
          category = await this.prisma.categories.create({
            data: {
              user_id: userId,
              name: updateDto.category,
              type: currentTx.type,
              icon: 'default',
            }
          });
        }
        
        dataToUpdate.category_id = category.id;
      }
    }

    return this.prisma.transactions.updateMany({
      where: { id: id, user_id: userId },
      data: dataToUpdate,
    });
  }
}