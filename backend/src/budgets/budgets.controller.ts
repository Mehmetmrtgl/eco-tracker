import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common';
import { BudgetsService } from './budgets.service';

@Controller('budgets')
export class BudgetsController {
  constructor(private readonly budgetsService: BudgetsService) {}

  @Post(':userId')
  setBudget(@Param('userId') userId: string, @Body() body: { categoryName: string; amount: number }) {
    return this.budgetsService.setBudget(userId, body);
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.budgetsService.getBudgetsWithUsage(userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('userId') userId: string) {
      // userId'yi body veya query'den alabiliriz, burada body'den alalım
      return this.budgetsService.remove(id, userId);
  }
}