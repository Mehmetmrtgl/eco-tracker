// backend/src/accounts/accounts.controller.ts

import { Controller, Get, Post, Body, Param, Delete, Patch } from '@nestjs/common'; // Patch eklendi
import { AccountsService } from './accounts.service';

@Controller('accounts')
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post(':userId')
  create(@Param('userId') userId: string, @Body() body: any) {
    return this.accountsService.create(userId, body);
  }

  @Get(':userId')
  findAll(@Param('userId') userId: string) {
    return this.accountsService.findAll(userId);
  }

  // YENİ: Hesap Güncelleme Kapısı
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    // Body içinde userId, name, balance bekleniyor
    return this.accountsService.update(id, body.userId, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Body('userId') userId: string) {
      return this.accountsService.remove(id, userId);
  }
}