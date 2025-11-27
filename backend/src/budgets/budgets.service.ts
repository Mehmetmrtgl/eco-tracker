import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class BudgetsService {
  constructor(private prisma: PrismaService) {}

  // Bütçe Ekle veya Güncelle (Upsert)
  async setBudget(userId: string, dto: { categoryName: string; amount: number }) {
    // 1. Kategori ID'sini bul (İsme göre)
    // Not: Transaction servisinde kategori yoksa oluşturuyorduk, 
    // burada var olan kategorilere bütçe koyulur varsayıyoruz.
    const category = await this.prisma.categories.findFirst({
      where: { user_id: userId, name: dto.categoryName, type: 'EXPENSE' }
    });

    if (!category) {
      // Kategori yoksa oluştur (Güvenlik için)
      const newCat = await this.prisma.categories.create({
        data: { user_id: userId, name: dto.categoryName, type: 'EXPENSE', icon: 'default' }
      });
      
      return this.prisma.budgets.create({
        data: {
          user_id: userId,
          category_id: newCat.id,
          amount: new Prisma.Decimal(dto.amount),
        }
      });
    }

    // Varsa güncelle veya oluştur (Upsert)
    return this.prisma.budgets.upsert({
      where: {
        user_id_category_id: { user_id: userId, category_id: category.id }
      },
      update: { amount: new Prisma.Decimal(dto.amount) },
      create: {
        user_id: userId,
        category_id: category.id,
        amount: new Prisma.Decimal(dto.amount),
      },
    });
  }

  // Bütçe Durumunu Getir (Harcanan vs Limit)
  async getBudgetsWithUsage(userId: string) {
    // 1. Kullanıcının tüm bütçelerini çek
    const budgets = await this.prisma.budgets.findMany({
      where: { user_id: userId },
      include: { categories: true }
    });

    // 2. Bu ayın harcamalarını hesaplamak için tarih aralığı
    // (Basitlik için takvim ayı kullanıyoruz: 1'i ile 31'i arası)
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // 3. Her bütçe için harcamayı bul
    const result = await Promise.all(budgets.map(async (budget) => {
      const expenses = await this.prisma.transactions.aggregate({
        _sum: { amount: true },
        where: {
          user_id: userId,
          category_id: budget.category_id,
          type: 'EXPENSE',
          transaction_date: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      return {
        id: budget.id,
        categoryName: budget.categories?.name,
        limit: budget.amount.toNumber(),
        spent: expenses._sum.amount?.toNumber() || 0,
      };
    }));

    return result;
  }

  // Bütçe Sil
  async remove(id: string, userId: string) {
    return this.prisma.budgets.deleteMany({
        where: { id: id, user_id: userId }
    });
  }
}