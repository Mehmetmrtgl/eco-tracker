import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Kullanıcı Ekleme
async create(data: Prisma.usersCreateInput) {
  const existingUser = await this.prisma.users.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('DUPLICATE_EMAIL');
    }

    return this.prisma.users.create({
      data,
    });
  }

  // Tüm Kullanıcıları Getirme
  async findAll() {
    return this.prisma.users.findMany();
  }

  // Tek Kullanıcı Getirme (ID: string yaptık)
  async findOne(id: string) {
    return this.prisma.users.findUnique({
      where: { id },
    });
  }

  async login(email: string, pass: string) {

    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user || user.password_hash !== pass) {
      return null;
    }

    return user;
  }

  async updateSettings(userId: string, data: { reset_day: number }) {
    return this.prisma.users.update({
      where: { id: userId },
      data: {
        reset_day: data.reset_day
      }
    });
  }
}