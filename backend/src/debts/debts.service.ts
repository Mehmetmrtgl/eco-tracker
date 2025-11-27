import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DebtsService {
  constructor(private prisma: PrismaService) {}

  // 1. BORÇ EKLEME (Yönlendirmeli)
  async create(userId: string, createDebtDto: any) {
    const totalAmount = Number(createDebtDto.total_amount);
    const type = createDebtDto.type; 
    
    // A. KREDİ KARTI İŞLEMİ
    if (type === 'CREDIT_CARD') {
        const cardId = createDebtDto.card_id;
        // Ekstre tutarı girildiyse al, yoksa 0
        const monthlyPayment = Number(createDebtDto.monthly_payment || 0);

        if (cardId) {
            // Mevcut kartı güncelle
            return this.prisma.credit_cards.update({
                where: { id: cardId },
                data: { 
                    current_debt: { increment: totalAmount },
                    statement_amount: { increment: monthlyPayment } // Ekstreyi de artır (isteğe bağlı)
                } 
            });
        }
        // Yeni kart oluştur
        return this.prisma.credit_cards.create({
            data: {
                user_id: userId,
                bank_name: createDebtDto.bank_name || 'Bilinmeyen',
                alias: createDebtDto.title || 'Yeni Kart',
                total_limit: new Prisma.Decimal(totalAmount * 2),
                current_debt: new Prisma.Decimal(totalAmount),
                statement_amount: new Prisma.Decimal(monthlyPayment), // İlk ekstre
            }
        });
    }

    // B. NORMAL BORÇ İŞLEMİ
    const recipientName = createDebtDto.recipient_name;
    const monthlyPayment = Number(createDebtDto.monthly_payment || 0);

    if (type === 'PERSON' && recipientName) {
      const existingDebt = await this.prisma.debts.findFirst({
        where: { user_id: userId, type: 'PERSON', recipient_name: recipientName, is_closed: false },
      });
      if (existingDebt) {
        return this.prisma.debts.update({
          where: { id: existingDebt.id },
          data: {
            remaining_amount: { increment: totalAmount },
            total_amount: { increment: totalAmount },
          },
        });
      }
    }

    return this.prisma.debts.create({
      data: {
        user_id: userId,
        title: createDebtDto.title,
        type: type,
        recipient_name: recipientName,
        total_amount: new Prisma.Decimal(totalAmount),
        remaining_amount: new Prisma.Decimal(totalAmount),
        monthly_payment: new Prisma.Decimal(monthlyPayment),
        due_date: createDebtDto.due_date ? new Date(createDebtDto.due_date) : null,
      },
    });
  }

  // 2. LİSTELEME (BİRLEŞTİRME)
  async findAll(userId: string) {
    // Normal Borçlar
    const normalDebts = await this.prisma.debts.findMany({
      where: { user_id: userId, is_closed: false },
      orderBy: { created_at: 'desc' },
    });

    // Kredi Kartları
    const creditCards = await this.prisma.credit_cards.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'asc' },
    });

    // Kartları Borç Formatına Dönüştür (Mapping)
    // BURADA KRİTİK NOKTA: statement_amount'u monthly_payment olarak gönderiyoruz!
    const mappedCards = creditCards.map(card => ({
        id: card.id,
        title: card.alias,
        bank_name: card.bank_name,
        type: 'CREDIT_CARD',
        total_amount: card.total_limit, // Limit (veya toplam borç gösterilebilir, aşağıda düzelttik)
        // Frontend "Toplam Borç" olarak remaining_amount'u kullanıyor. Kart için bu current_debt'tir.
        remaining_amount: card.current_debt, 
        
        // Frontend "Bu Ayki Ödeme" olarak monthly_payment'i kullanıyor. Kart için bu statement_amount'tur.
        monthly_payment: card.statement_amount, 
        
        due_date: null, // İstenirse hesaplanabilir
        is_closed: false,
    }));

    return [...normalDebts, ...mappedCards];
  }

  // 3. GÜNCELLEME (UpdateDebtDialog BURAYI ÇAĞIRIYOR)
  async update(id: string, updateDto: { total_amount?: number, monthly_payment?: number }) {
    // Önce normal borçlarda ara
    const debt = await this.prisma.debts.findUnique({ where: { id } });
    
    if (debt) {
        // Normal Borç Güncelle
        const dataToUpdate: any = {};
        if (updateDto.total_amount !== undefined) dataToUpdate.remaining_amount = new Prisma.Decimal(updateDto.total_amount);
        if (updateDto.monthly_payment !== undefined) dataToUpdate.monthly_payment = new Prisma.Decimal(updateDto.monthly_payment);
        
        return this.prisma.debts.update({
            where: { id },
            data: dataToUpdate
        });
    }

    // Yoksa Kredi Kartlarında ara
    const card = await this.prisma.credit_cards.findUnique({ where: { id } });
    
    if (card) {
        // Kredi Kartı Güncelle
        const dataToUpdate: any = {};
        // Frontend'den gelen "Toplam Borç", kartın "Güncel Borcu"dur.
        if (updateDto.total_amount !== undefined) dataToUpdate.current_debt = new Prisma.Decimal(updateDto.total_amount);
        // Frontend'den gelen "Aylık Ödeme", kartın "Ekstre Borcu"dur.
        if (updateDto.monthly_payment !== undefined) dataToUpdate.statement_amount = new Prisma.Decimal(updateDto.monthly_payment);

        return this.prisma.credit_cards.update({
            where: { id },
            data: dataToUpdate
        });
    }

    throw new BadRequestException("Kayıt bulunamadı.");
  }
  
  // 4. ÖDEME YAPMA
  async recordPayment(id: string, paymentAmount: number) {
     const payment = Number(paymentAmount);
     
     return this.prisma.$transaction(async (prisma) => {
        // A. Normal Borç Ödemesi
        const debt = await prisma.debts.findUnique({ where: { id } });
        if (debt) {
            const cashAccount = await prisma.accounts.findFirst({ where: { user_id: debt.user_id, name: 'Cüzdanım' } });
            if(cashAccount) await prisma.accounts.update({ where: { id: cashAccount.id }, data: { balance: { decrement: payment } } });
            
            const newRemaining = Number(debt.remaining_amount) - payment;
            const currentMonthly = Number(debt.monthly_payment || 0);
            let newMonthly = currentMonthly - payment;
            if (newMonthly < 0) newMonthly = 0;

            return prisma.debts.update({
                where: { id },
                data: { 
                    remaining_amount: new Prisma.Decimal(newRemaining > 0 ? newRemaining : 0),
                    monthly_payment: new Prisma.Decimal(newMonthly),
                    is_closed: newRemaining <= 0.5 
                }
            });
        }

        // B. Kredi Kartı Ödemesi
        const card = await prisma.credit_cards.findUnique({ where: { id } });
        if (card) {
            const cashAccount = await prisma.accounts.findFirst({ where: { user_id: card.user_id, name: 'Cüzdanım' } });
            if(cashAccount) await prisma.accounts.update({ where: { id: cashAccount.id }, data: { balance: { decrement: payment } } });

            const newDebt = Number(card.current_debt) - payment;
            
            // Ekstreden de düşelim
            const currentStatement = Number(card.statement_amount || 0);
            let newStatement = currentStatement - payment;
            if (newStatement < 0) newStatement = 0;

            // İşlemi Kaydet (Kategori Kredi Kartı)
            let category = await prisma.categories.findFirst({ where: { user_id: card.user_id, name: 'KrediKarti', type: 'EXPENSE' } });
            if (!category) category = await prisma.categories.create({ data: { user_id: card.user_id, name: 'KrediKarti', type: 'EXPENSE', icon: 'default' } });

            await prisma.transactions.create({
                data: {
                    user_id: card.user_id,
                    type: 'EXPENSE',
                    amount: new Prisma.Decimal(payment),
                    category_id: category.id,
                    description: `${card.alias} Ödemesi`,
                    transaction_date: new Date(),
                    account_id: cashAccount?.id,
                    credit_card_id: card.id, 
                }
            });

            return prisma.credit_cards.update({
                where: { id },
                data: { 
                    current_debt: newDebt > 0 ? newDebt : 0,
                    statement_amount: new Prisma.Decimal(newStatement) // Ekstreyi güncelle
                }
            });
        }
        throw new BadRequestException("Borç veya Kart bulunamadı.");
     });
  }
}