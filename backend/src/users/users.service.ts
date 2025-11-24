import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Kullanıcı Ekleme
  async create(data: Prisma.usersCreateInput) {
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
}