import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class TasksService {
  constructor(@InjectQueue('email') private emailQueue: Queue,private readonly logger: Logger,private readonly emailService: EmailService ) {}


  async addEmailJob(accessToken: string, type: string) {
    this.logger.verbose("adding....")
    await this.emailService.parseGmail(accessToken);
    //const job = await this.emailQueue.add('send', { accessToken, type },{ priority: 1 },);
   // this.logger.verbose("finished....",job)
  }


  @Cron(CronExpression.EVERY_5_SECONDS)
  async scheduleEmailCheck(tokens: string, type: string) {
    this.logger.verbose("accessToken....")
    await this.emailQueue.add('check-emails', { tokens, type });
    this.logger.verbose("accessToken....")
  }


  // @Cron(CronExpression.EVERY_30_SECONDS)
  // async scheduleEmailCheck(tokens: string, type: string) {
  //   this.logger.verbose("accessToken....")
  //   await this.emailQueue.add('check-emails', { tokens, type }, { repeat: { cron: '*/* * * * *' } });
  //   this.logger.verbose("accessToken....")
  // }
}
