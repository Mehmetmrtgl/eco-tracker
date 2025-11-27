// backend/src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module'; 
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { AssetsModule } from './assets/assets.module';
import { ExchangeRateModule } from './exchange-rate/exchange-rate.module';
import { DebtsModule } from './debts/debts.module';
import { TransactionsModule } from './transactions/transactions.module';
import { TasksService } from './tasks/tasks.service';
import { BudgetsModule } from './budgets/budgets.module';
import { CreditCardsModule } from './credit-cards/credit-cards.module';
import { AccountsModule } from './accounts/accounts.module';
@Module({
  imports: [
    PrismaModule, 
    UsersModule, AuthModule, AssetsModule, ExchangeRateModule, DebtsModule, TransactionsModule, BudgetsModule, CreditCardsModule, AccountsModule,
  ],
  controllers: [AppController],
  providers: [AppService, TasksService], 
})
export class AppModule {}