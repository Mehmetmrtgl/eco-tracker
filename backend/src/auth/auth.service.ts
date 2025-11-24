// backend/src/auth/auth.service.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    const user = await this.prisma.users.findUnique({
      where: { email },
    });

    if (!user || user.password_hash !== pass) {
      throw new UnauthorizedException('E-posta veya şifre hatalı!');
    }

    const payload = { sub: user.id, email: user.email, name: user.full_name };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: { 
        full_name: user.full_name,
        email: user.email
      }
    };
  }
}