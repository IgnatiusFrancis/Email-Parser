import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import OpenAI from 'openai'; 
import { CompletionCreateParams } from 'openai/resources';

@Injectable()
export class EmailService {
  private openai: OpenAI; 

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get('OPENAI_API_KEY');
    this.openai = new OpenAI({ apiKey });
  }
  async parseGmail(accessToken: string) {
try {
  console.log("Start....")
  const gmail = google.gmail({ version: 'v1', auth: accessToken });
  const messages = await gmail.users.messages.list({ userId: 'me' });
 
  for (const message of messages.data.messages||[]) {
    const msg = await gmail.users.messages.get({ userId: 'me', id: message.id });
    const context = await this.getContext(msg.data.snippet);
    const label = this.assignLabel(context);
    await this.sendReply(gmail, message.id, label, context);
  }
} catch (error) {
  throw new HttpException(error, HttpStatus.INTERNAL_SERVER_ERROR)
}
  }

  private async getContext(snippet: string): Promise<string> {
  try {
    const params: CompletionCreateParams = {
      model: 'text-davinci-003',
      prompt: `Extract context from this email snippet: ${snippet}`,
      max_tokens: 50,
    };
    const response = await this.openai.completions.create(params);
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
