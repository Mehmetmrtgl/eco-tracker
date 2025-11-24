import { Controller, Get, Post, Body, Param, Patch } from '@nestjs/common';
import { DebtsService } from './debts.service';

@Controller('debts')
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post(':userId')

  create(@Param('userId') userId: string, @Body() createDebtDto: any) {
    return this.debtsService.create(userId, createDebtDto);
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.debtsService.findAll(userId);
  }

  @Patch(':debtId/payment')
  recordPayment(
    @Param('debtId') debtId: string, 
    @Body('paymentAmount') paymentAmount: number
  ) {
    return this.debtsService.recordPayment(debtId, paymentAmount);
  }

  @Patch(':debtId')
  update(
    @Param('debtId') debtId: string, 
    @Body() updateDto: { total_amount?: number, monthly_payment?: number }
  ) {
    return this.debtsService.update(debtId, updateDto);
  }
}