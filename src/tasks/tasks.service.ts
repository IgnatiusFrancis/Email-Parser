import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from 'src/email/email.service';
import { RedisService } from './redis.service';

@Injectable()
export class TasksService {
  constructor(
    @InjectQueue('emailParser') private emailQueue: Queue,
    private readonly logger: Logger,
  ) {}

  async addEmailJob(accessToken: string, type: string) {
  
    const job = await this.emailQueue.add('sendMail', { accessToken, type });
    this.logger.debug('Email job added:', job.id);
  }

  @Cron(CronExpression.EVERY_5_SECONDS)
  async scheduleEmailCheck(tokens: string, type: string) {
    this.logger.verbose('accessToken....');
    await this.emailQueue.add('check-emails', { tokens, type });
    this.logger.verbose('accessToken....');
  }
}



