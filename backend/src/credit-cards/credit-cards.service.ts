import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class CreditCardsService {
  constructor(private prisma: PrismaService) {}

  // Kart Ekle
  async create(userId: string, dto: any) {
    return this.prisma.credit_cards.create({
      data: {
        user_id: userId,
        bank_name: dto.bankName,
        alias: dto.alias,
        total_limit: new Prisma.Decimal(dto.limit),
        cutoff_day: Number(dto.cutoffDay),
        due_day: Number(dto.dueDay),
        current_debt: new Prisma.Decimal(0), // İlk başta borç 0
      },
    });
  }

  // Kartları Getir
  async findAll(userId: string) {
    return this.prisma.credit_cards.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
  }

  // Kart Sil
  async remove(id: string, userId: string) {
    return this.prisma.credit_cards.deleteMany({
      where: { id, user_id: userId }
    });
  }
  
  // Kart Güncelle (Limit veya Günler değişirse)
  async update(id: string, userId: string, dto: any) {
    return this.prisma.credit_cards.updateMany({
        where: { id, user_id: userId },
        data: {
            alias: dto.alias,
            total_limit: new Prisma.Decimal(dto.limit),
            cutoff_day: Number(dto.cutoffDay),
            due_day: Number(dto.dueDay),
        }
    });
  }
}