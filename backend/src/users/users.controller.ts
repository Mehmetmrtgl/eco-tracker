import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

@Post()
  async create(@Body() createUserDto: Prisma.usersCreateInput) {
    try {
      const newUser = await this.usersService.create(createUserDto);
      
      return { status: 'success', data: newUser };

    } catch (error) {
      
      console.error('Kayıt Hatası Detayı:', error);

      if (error.message === 'DUPLICATE_EMAIL') {
        return { status: 'error', message: 'Bu e-posta adresi zaten kullanımda.' };
      }

      return { status: 'error', message: 'Kayıt olurken sunucu hatası oluştu.' };
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

  @Post('login')
  async login(@Body() body: { email: string; password_hash: string }) {
    const user = await this.usersService.login(body.email, body.password_hash);
    
    if (!user) {
      return { status: 'error', message: 'Hatalı e-posta veya şifre!' };
    }
    
    return { status: 'success', user };
  }
}