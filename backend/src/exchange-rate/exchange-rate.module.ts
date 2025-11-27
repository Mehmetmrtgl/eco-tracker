// backend/src/exchange-rate/exchange-rate.module.ts

import { Module } from '@nestjs/common';
import { ExchangeRateService } from './exchange-rate.service';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ExchangeRateController } from './exchange-rate.controller'; // <-- YENİ IMPORT

@Module({
  imports: [HttpModule, ScheduleModule.forRoot()], 
  controllers: [ExchangeRateController], // <-- BURAYA EKLE
  providers: [ExchangeRateService],
  exports: [ExchangeRateService],
})
export class ExchangeRateModule {}