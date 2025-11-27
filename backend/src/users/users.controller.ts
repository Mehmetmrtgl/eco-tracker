import { Controller, Get, Post, Body, Param, Patch, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service';
import { TransactionsService } from '../transactions/transactions.service'; // <-- YENİ
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly transactionsService: TransactionsService // <-- ENJEKTE ET
  ) {}

  @Post()
  async create(@Body() createUserDto: Prisma.usersCreateInput) {
    try {
      const newUser = await this.usersService.create(createUserDto);
      return { status: 'success', data: newUser };
    } catch (error) {
      console.error('Kayıt Hatası:', error);
      if (error.message === 'DUPLICATE_EMAIL') {
        return { status: 'error', message: 'Bu e-posta adresi zaten kullanımda.' };
      }
      return { status: 'error', message: 'Kayıt sırasında bir hata oluştu.' };
    }
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/settings')
  updateSettings(@Param('id') id: string, @Body() body: any) {
    return this.usersService.updateSettings(id, body);
  }

  // --- YENİ: MAAŞI MANUEL TETİKLEME ---
@Post(':id/trigger-salary')
  async triggerSalary(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    if (!user || !user.salary_amount || Number(user.salary_amount) <= 0) {
        throw new NotFoundException("Maaş bilgisi bulunamadı.");
    }

    // TransactionsService üzerinden işlem oluşturuyoruz.
    // Bu servis zaten hem Cüzdanı güncelliyor hem de Transactions tablosuna yazıyor.
    await this.transactionsService.create(user.id, {
        amount: Number(user.salary_amount),
        type: 'INCOME',
        category: 'Maas', // Kategori ismi önemli
        description: 'Manuel Maaş Girişi',
        paymentMethod: 'CASH',
        date: new Date().toISOString(),
    });

    return { status: 'success', message: 'Maaş hesaba eklendi.' };
  }
}