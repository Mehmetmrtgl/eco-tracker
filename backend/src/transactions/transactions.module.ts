// backend/src/transactions/transactions.module.ts

import { Module } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { TransactionsController } from './transactions.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { BudgetsModule } from '../budgets/budgets.module'; // <-- YENİ IMPORT

@Module({
  imports: [PrismaModule, BudgetsModule], // <-- BURAYA EKLE
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService]
})
export class TransactionsModule {}