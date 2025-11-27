import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common';
import { CreditCardsService } from './credit-cards.service';

@Controller('credit-cards')
export class CreditCardsController {
  constructor(private readonly creditCardsService: CreditCardsService) {}

  @Post(':userId')
  create(@Param('userId') userId: string, @Body() body: any) {
    return this.creditCardsService.create(userId, body);
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.creditCardsService.findAll(userId);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    // userId body'den gelmeli veya Guard kullanılmalı. Şimdilik body'den alalım.
    return this.creditCardsService.update(id, body.userId, body); 
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body() body: { userId: string }) {
    return this.creditCardsService.remove(id, body.userId);
  }
}