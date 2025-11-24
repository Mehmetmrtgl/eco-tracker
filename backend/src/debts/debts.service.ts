import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  // Borç Ekleme
  async create(userId: string, createDebtDto: any) {
    const totalAmount = Number(createDebtDto.total_amount);
    const type = createDebtDto.type;
    const recipientName = createDebtDto.recipient_name;
    const monthlyPayment = Number(createDebtDto.monthly_payment || 0);

    // 1. ŞAHIS BORCU İSE (P2P Merging)
    if (type === 'PERSON' && recipientName) {
      const existingDebt = await this.prisma.debts.findFirst({
        where: {
          user_id: userId,
          type: 'PERSON',
          recipient_name: recipientName, // Aynı kişiye borçlanıyor muyuz?
          is_closed: false,
        },
      });

      if (existingDebt) {
        // Borç zaten varsa: Kalan borcu ve toplam borcu üzerine ekle
        const newRemaining = Number(existingDebt.remaining_amount) + totalAmount;
        const newTotal = Number(existingDebt.total_amount) + totalAmount;

        return this.prisma.debts.update({
          where: { id: existingDebt.id },
          data: {
            remaining_amount: new Prisma.Decimal(newRemaining),
            total_amount: new Prisma.Decimal(newTotal),
            monthly_payment: new Prisma.Decimal(
                (existingDebt.monthly_payment?.toNumber() || 0) + monthlyPayment // Taksitleri de topla
            ),
          },
        });
      }
    }

    // 2. Yeni Borç Oluşturma (Ya P2P'de yeni kişi, ya Kredi/Kredi Kartı)
    return this.prisma.debts.create({
      data: {
        user_id: userId,
        title: createDebtDto.title,
        type: type,
        bank_name: createDebtDto.bank_name,
        recipient_name: recipientName,
        total_amount: new Prisma.Decimal(totalAmount),
        remaining_amount: new Prisma.Decimal(totalAmount),
        monthly_payment: new Prisma.Decimal(monthlyPayment),
        due_date: createDebtDto.due_date ? new Date(createDebtDto.due_date) : null,
      },
    });
  }

  // Aktif Borçları Listeleme (Kapalıları Hariç)
  async findAll(userId: string) {
    return this.prisma.debts.findMany({
      where: {
        user_id: userId,
        is_closed: false, // Sadece aktif borçları göster
      },
      orderBy: { created_at: 'desc' },
    });
  }
  
  // Ödeme Kaydetme İşlemi (En önemli kısım)
  // Ödeme Kaydetme İşlemi (Nakit Cüzdan Entegrasyonlu)
  async recordPayment(debtId: string, paymentAmount: number) {
    const payment = Number(paymentAmount);

    if (payment <= 0) {
      throw new BadRequestException('Ödeme miktarı sıfırdan büyük olmalıdır.');
    }

    return this.prisma.$transaction(async (prisma) => {
      // 1. Borcu ve Cüzdanı Bul
      const debt = await prisma.debts.findUnique({ where: { id: debtId } });
      if (!debt || debt.is_closed) throw new BadRequestException('Borç bulunamadı.');

      const cashAccount = await prisma.accounts.findFirst({
        where: { user_id: debt.user_id, name: 'Nakit Cüzdanı' },
      });

      if (!cashAccount) throw new BadRequestException('Nakit Cüzdanı bulunamadı.');

      // 2. Nakit Cüzdanından Düş
      await prisma.accounts.update({
        where: { id: cashAccount.id },
        data: { balance: { decrement: new Prisma.Decimal(payment) } },
      });

      // 3. BORCU GÜNCELLE (YENİ MANTIK BURADA)
      const currentRemaining = Number(debt.remaining_amount);
      const newRemaining = currentRemaining - payment;
      const isClosed = newRemaining <= 0.5;

      // Bu ayki ödemeden de düş (0'ın altına inmesin)
      const currentMonthly = Number(debt.monthly_payment || 0);
      let newMonthly = currentMonthly - payment;
      if (newMonthly < 0) newMonthly = 0; // Eksiye düşerse 0 yap

      const updatedDebt = await prisma.debts.update({
        where: { id: debtId },
        data: {
          remaining_amount: new Prisma.Decimal(newRemaining > 0 ? newRemaining : 0),
          monthly_payment: new Prisma.Decimal(newMonthly), // <-- GÜNCELLENDİ
          is_closed: isClosed,
        },
      });

      return updatedDebt;
    });
  }

  async update(debtId: string, updateDto: { total_amount?: number, monthly_payment?: number }) {
    const dataToUpdate: any = {};
    
    if (updateDto.total_amount !== undefined) {
        dataToUpdate.total_amount = new Prisma.Decimal(updateDto.total_amount);
        dataToUpdate.remaining_amount = new Prisma.Decimal(updateDto.total_amount);
    }

    if (updateDto.monthly_payment !== undefined) {
        dataToUpdate.monthly_payment = new Prisma.Decimal(updateDto.monthly_payment);
    }

    return this.prisma.debts.update({
      where: { id: debtId },
      data: dataToUpdate,
    });
  }
}