import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK) 
  @Post('login')
  login(@Body() signInDto: { email: string; password_hash: string }) {
    return this.authService.login(signInDto.email, signInDto.password_hash);
  }
}