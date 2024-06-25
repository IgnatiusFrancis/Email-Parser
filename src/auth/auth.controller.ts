import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  getGoogleAuthUrl() {
    return this.authService.getGoogleAuthUrl();
  }

  @Get('google/callback')
  async googleCallback(@Query('code') code: string) {
    console.log("REDIRECTING FOR TOKEN")
    return await this.authService.getGoogleTokens(code);
  }
}
