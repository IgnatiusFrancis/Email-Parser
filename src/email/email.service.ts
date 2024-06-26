import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import OpenAI from 'openai'; 
import { CompletionCreateParams } from 'openai/resources';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private openai: OpenAI; 

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    this.openai = new OpenAI({ 
      organization:"org-hLMIGougp9ZvKMV8YTOdLcyN",
      project: "proj_9Y1Io1zR94lSu4PtrsonalXs",
     });
  }
  async parseGmail(accessToken: string) {
try {
  this.logger.verbose('Start fetching messages...');
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const messages = await gmail.users.messages.list({ userId: 'me' });

  this.logger.debug('Fetched messages...');
 
  for (const message of messages.data.messages||[]) {
    const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
    const context = await this.getContext(msg.data.snippet);
    this.logger.debug('context', context);
    const label = this.assignLabel(context);
    this.logger.debug('label', label);
    await this.sendReply(gmail, message.id, label, context);
  }
} catch (error) {
  throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
}
  }

  private async getContext(snippet: string): Promise<string> {
  try {
    this.logger.debug('context checking');
    const params: CompletionCreateParams = {
      model: 'gpt-3.5-turbo',
      prompt: `Extract context from this email snippet: ${snippet}`,
      max_tokens: 10,
    };
    const response = await this.openai.completions.create(params);
    this.logger.debug('context response', response);
    return response.choices[0].text.trim();
  } catch (error) {
    throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
  }
  }

  private assignLabel(context: string): string {
    if (context.includes('interested')) return 'Interested';
    if (context.includes('not interested')) return 'Not Interested';
    if (context.includes('more information')) return 'More information';
    return 'Uncategorized';
  }

  private async sendReply(gmail, messageId, label, context) {
    let reply;
    switch (label) {
      case 'Interested':
        reply = 'Thank you for your interest! Would you like to schedule a demo call?';
        break;
      case 'Not Interested':
        reply = 'Thank you for your response. If you change your mind, feel free to reach out.';
        break;
      case 'More information':
        reply = 'Can you please specify what information you need?';
        break;
      default:
        reply = 'Thank you for your email.';
        break;
    }
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: Buffer.from(`To: ${messageId}\r\nSubject: Re: ${context}\r\n\r\n${reply}`).toString('base64'),
      },
    });
  }
}
