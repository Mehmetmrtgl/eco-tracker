import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule'; // <-- YENİ

@Module({
  imports: [
    HttpModule,
    ScheduleModule.forRoot() // <-- BURAYA EKLENDİ
  ], 
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class ExchangeRateModule {}