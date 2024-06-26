import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { google, Auth } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { ConfigService } from '@nestjs/config';
import { RedisService } from 'src/tasks/redis.service';

@Injectable()
export class AuthService {
  private googleOAuth2Client: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
    private readonly logger: Logger,
  ) {
    this.googleOAuth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URL'),
    );
  }

  getGoogleAuthUrl(): string {
    try {
      this.logger.debug('About to generate auth URL');
      const scopes = [this.configService.get<string>('SCOPE')];
      const resp = this.googleOAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        prompt: 'consent',
      });
      this.logger.debug('Generated URL:', resp);
      return resp;
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getGoogleTokens(code: string): Promise<any> {
    try {
      this.logger.debug('About to generate tokens');
      const { tokens } = await this.googleOAuth2Client.getToken(code);
      this.googleOAuth2Client.setCredentials(tokens);

      this.logger.debug("access_token",tokens.access_token, tokens.refresh_token, tokens.expiry_date / 1000)
      
      // Store tokens in Redis
      await this.redisService.setValue('access_token', tokens.access_token, Math.floor(tokens.expiry_date / 1000));
await this.redisService.setValue('refresh_token', tokens.refresh_token);


      this.logger.log('Tokens stored in Redis');
      this.logger.debug('Generated Token:', tokens);

return tokens
    } catch (error) {
      this.logger.error(error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getMessages(accessToken: string) : Promise<any> {
    try {
      this.logger.log('Start fetching messages...');
      const oauth2Client = new google.auth.OAuth2();
      oauth2Client.setCredentials({ access_token: accessToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
      const messages = await gmail.users.messages.list({ userId: 'me' });

      this.logger.log('Fetched messages:', messages);
      return messages;
    } catch (error) {
      this.logger.error('Error retrieving messages', error);
      throw new HttpException('Failed to retrieve messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAccessToken(): Promise<string> {
    let accessToken = await this.redisService.getValue('access_token');
    if (!accessToken) {
      const refreshToken = await this.redisService.getValue('refresh_token');
      if (refreshToken) {
        throw new HttpException('No valid tokens found', HttpStatus.UNAUTHORIZED);
       // accessToken = await this.refreshAccessToken(refreshToken);
      } else {
        throw new HttpException('No valid tokens found', HttpStatus.UNAUTHORIZED);
      }
    }
    return accessToken;
  }

  // private async refreshAccessToken(refreshToken: string): Promise<string> {
  //   try {
  //     const { credentials } = await this.googleOAuth2Client.refreshToken(refreshToken) as GetTokenResponse;
  //     await this.redisService.setValue('access_token', credentials.access_token, credentials.expiry_date / 1000);
  //     if (credentials.refresh_token) {
  //       await this.redisService.setValue('refresh_token', credentials.refresh_token);
  //     }
  //     return credentials.access_token;
  //   } catch (error) {
  //     this.logger.error('Error refreshing access token', error);
  //     throw new HttpException('Failed to refresh access token', HttpStatus.INTERNAL_SERVER_ERROR);
  //   }
  // }
}
