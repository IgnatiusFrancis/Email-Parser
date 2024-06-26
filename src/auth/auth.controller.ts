import { Body, Controller, Get, HttpStatus, Logger, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { TasksService } from 'src/tasks/tasks.service';
import { RedisService } from 'src/tasks/redis.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly tasksService: TasksService,
    private readonly redisService: RedisService
  ) {}

  @Get('google')
  getGoogleAuthUrl() {
    return this.authService.getGoogleAuthUrl();
  }

  // @Get('google/callback')
  // async googleCallback(@Body('access_token') access_token: string, @Res() res) {
  //   try {
  //     this.logger.debug('Handling Google OAuth callback with code:');

  //     // Check if access token exists in Redis and is valid
  //     const storedAccessToken = await this.redisService.getValue(access_token);
  //     if (storedAccessToken) {
  //       this.logger.debug(`Stored access token: ${storedAccessToken}`);
  //       // Token is already in Redis and is valid, add job to queue
  //       await this.tasksService.addEmailJob(storedAccessToken, 'gmail');
  //       res.send('Email successfully parsed');
  //     } else {
  //       // Either token doesn't exist or is invalid, handle accordingly
  //       this.logger.warn('Access token not found or invalid in Redis');
  //       res.status(401).send('Invalid access token');
  //     }
  //   } catch (error) {
  //     this.logger.error('Error during Google OAuth callback:', error);
  //     res.status(500).send('Google OAuth failed');
  //   }
  // }



  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res) {
    try {
      this.logger.debug("Start of callback handler");
      const tokens = await this.authService.getGoogleTokens(code);
      this.logger.debug("Tokens received", tokens);

      await this.tasksService.addEmailJob(tokens.access_token, 'gmail')

      return res.status(HttpStatus.OK).json("messages Successfully");
    } catch (error) {
      this.logger.error('Error during Google OAuth callback', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    }
  }
}
