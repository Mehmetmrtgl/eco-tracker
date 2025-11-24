import { Module } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { AssetsController } from './assets.controller';
import { ExchangeRateModule } from '../exchange-rate/exchange-rate.module'; 

@Module({
  imports: [
    ExchangeRateModule, 
  ],
  controllers: [AssetsController],
  providers: [AssetsService],
})
export class AssetsModule {}