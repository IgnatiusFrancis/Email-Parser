import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private googleOAuth2Client: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {
    this.googleOAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URL'),
    );
  }

  getGoogleAuthUrl() {
    try {
      this.logger.debug('ABout to generate auth url');
      const scopes = [this.configService.get<string>('SCOPE')];
      const resp = this.googleOAuth2Client.generateAuthUrl({
        access_type: this.configService.get<string>('ACCESS_TYPE'),
        scope: scopes,
      });

      this.logger.debug('Generated url:', resp);
      return resp;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getGoogleTokens(code: string) {
    try {
      this.logger.debug('Abot to generate tokens');
      const { tokens } = await this.googleOAuth2Client.getToken(code);
      this.googleOAuth2Client.setCredentials(tokens);
      this.logger.debug('Generated Token:', tokens);
      return tokens;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
