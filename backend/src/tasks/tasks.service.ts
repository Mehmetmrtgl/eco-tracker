// backend/src/tasks/tasks.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { TransactionsService } from '../transactions/transactions.service';

@Injectable()
export class TasksService {
  private readonly logger = new Logger(TasksService.name);

  constructor(
    private prisma: PrismaService,
    private transactionsService: TransactionsService
  ) {}

  // Her gece 00:01'de çalışır
  @Cron('1 0 * * *') 
  async handleCron() {
    this.logger.log('Otomatik görevler çalışıyor...');
    
    const today = new Date();
    const currentDay = today.getDate(); // Bugün ayın kaçı? (Örn: 15)

    // 1. MAAŞ GÜNÜ GELENLERİ BUL
    // Maaş günü "bugün" olan VE maaş miktarı 0'dan büyük olan kullanıcıları getir
    const usersToPay = await this.prisma.users.findMany({
      where: {
        salary_day: currentDay,
        salary_amount: { gt: 0 }
      }
    });

    this.logger.log(`${usersToPay.length} kullanıcı için maaş günü tespit edildi.`);

    // 2. HER BİRİNE OTOMATİK GELİR EKLE
    for (const user of usersToPay) {
      try {
        // Zaten bugün maaş eklenmiş mi diye kontrol et (Çift ödemeyi önle)
        // (Basit bir kontrol: Bugün tarihli, 'Maas' kategorili işlem var mı?)
        // Bu kısım opsiyoneldir ama güvenlidir.
        
        await this.transactionsService.create(user.id, {
          amount: Number(user.salary_amount),
          type: 'INCOME',
          category: 'Maas',
          description: 'Otomatik Maaş Yatışı',
          paymentMethod: 'CASH', // Nakit cüzdanına ekle
          date: today.toISOString(),
        });
        
        this.logger.log(`Kullanıcı ${user.id} için maaş eklendi.`);
        
      } catch (error) {
        this.logger.error(`Maaş eklenirken hata: User ${user.id}`, error);
      }
    }
  }
}