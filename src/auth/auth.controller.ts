import { Body, Controller, Get, HttpStatus, Logger, Query, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectQueue } from '@nestjs/bull';
import { GoogleTokenDto } from './google-token.dto';
import { Queue } from 'bull';
import { TasksService } from 'src/tasks/tasks.service';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly tasksService: TasksService
  ) {}

  @Get('google')
  getGoogleAuthUrl() {
    return this.authService.getGoogleAuthUrl();
  }

  // @Get('google/callback')
  // async googleCallback(@Body() tokens: GoogleTokenDto, @Res() res) {
  //   try {
  //     this.logger.debug('Handling Google OAuth callback with code:');
  //     const accessToken = tokens.access_token;
  //     this.logger.verbose(`Access token: ${accessToken}`);
  //     // Use TasksService to add the job
  //     await this.tasksService.addEmailJob(accessToken, 'gmail');
  //     res.send('Google OAuth successful');
  //   } catch (error) {
  //     this.logger.error('Error during Google OAuth callback:', error);
  //     res.status(500).send('Google OAuth failed');
  //   }
  // }

  // @Get('google/callback')
  // async googleCallback(@Query('code') code: string) {
  //   console.log("REDIRECTING FOR TOKEN")
  //   return await this.authService.getGoogleTokens(code);
  // }

  @Get('google/callback')
  async googleAuthCallback(@Query('code') code: string, @Res() res) {
    try {
      this.logger.log("Start of callback handler");
      const tokens = await this.authService.getGoogleTokens(code);
      this.logger.log("Tokens received", tokens);

      // Optionally store tokens securely in your database here
      const messages = await this.authService.getMessages(tokens.access_token);
      this.logger.log("Retrieved messages", messages);

      return res.status(HttpStatus.OK).json(messages);
    } catch (error) {
      this.logger.error('Error during Google OAuth callback', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).send(error.message);
    }
  }
}
