import { Controller, Get, Post, Body, Param, Query, Delete, Patch } from '@nestjs/common'; 
import { TransactionsService } from './transactions.service';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post(':userId')
  create(@Param('userId') userId: string, @Body() createTransactionDto: any) {
    return this.transactionsService.create(userId, createTransactionDto);
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.transactionsService.findAll(userId);
  }

  @Get(':userId/analysis')
  getAnalysis(
    @Param('userId') userId: string,
    @Query('start') start: string,
    @Query('end') end: string
  ) {
    return this.transactionsService.getAnalysis(
        userId, 
        new Date(start), 
        new Date(end)
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Query('userId') userId: string) {
    return this.transactionsService.remove(id, userId);
  }

  // Güncelleme Kapısı
  @Patch(':id')
  update(
    @Param('id') id: string, 
    @Query('userId') userId: string, 
    @Body() updateDto: any
  ) {
    return this.transactionsService.update(id, userId, updateDto);
  }
}