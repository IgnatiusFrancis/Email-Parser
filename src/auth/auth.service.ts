import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private googleOAuth2Client: OAuth2Client;

  constructor(private readonly configService: ConfigService) {
    this.googleOAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URL'),
    );
  }

  getGoogleAuthUrl() {
    const scopes = [this.configService.get<string>('SCOPE')];
    return this.googleOAuth2Client.generateAuthUrl({
      access_type: this.configService.get<string>('ACCESS_TYPE'),
      scope: scopes,
    });
  }

  async getGoogleTokens(code: string) {
    const { tokens } = await this.googleOAuth2Client.getToken(code);
    this.googleOAuth2Client.setCredentials(tokens);
    return tokens;
  }
}
