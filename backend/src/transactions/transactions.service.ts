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
      // SIRALAMA MANTIĞI DEĞİŞTİ:
      orderBy: [
        { transaction_date: 'desc' }, // 1. Öncelik: İşlem Tarihi (Bugün en üstte)
        { created_at: 'desc' }        // 2. Öncelik: Eklenme Zamanı (Son eklenen en üstte)
      ],
      include: { 
        debts: true,     
        accounts: true,  
        categories: true 
      }, 
    });
  }
}