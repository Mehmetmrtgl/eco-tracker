// backend/src/accounts/accounts.service.ts

import { Injectable, BadRequestException } from '@nestjs/common'; // BadRequestException eklendi
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class AccountsService {
  constructor(private prisma: PrismaService) {}

  // Yeni Hesap Ekle
  async create(userId: string, dto: any) {
    return this.prisma.accounts.create({
      data: {
        user_id: userId,
        name: dto.name, 
        type: 'CASH',
        currency: 'TRY',
        balance: new Prisma.Decimal(dto.balance || 0), 
      },
    });
  }

  // Hesapları Listele
  async findAll(userId: string) {
    return this.prisma.accounts.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });
  }
  
  // YENİ: Hesap Bilgilerini Güncelle (Ad ve Bakiye)
  async update(id: string, userId: string, dto: { name?: string; balance?: number }) {
    const updateData: any = {};
    
    if (dto.name) updateData.name = dto.name;
    // Not: Bakiye sadece başlangıçta yanlış girildiyse düzeltilmeli, 
    // normalde transactions ile güncellenmeli.
    if (dto.balance !== undefined) updateData.balance = new Prisma.Decimal(dto.balance);
    
    return this.prisma.accounts.updateMany({
      where: { id, user_id: userId }, // Güvenlik kontrolü
      data: updateData,
    });
  }

  // Hesap Sil
  async remove(id: string, userId: string) {
    return this.prisma.accounts.deleteMany({
        where: { id, user_id: userId }
    });
  }
}