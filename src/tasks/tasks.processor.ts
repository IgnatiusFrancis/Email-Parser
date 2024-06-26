import { Process, Processor } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { EmailService } from 'src/email/email.service';


@Processor('email')
export class TasksProcessor {
  private readonly logger = new Logger(TasksProcessor.name);

  constructor(private readonly emailService: EmailService) {}

  @Process('send')
  async handleEmailJob(job: Job<{ accessToken: string; type: string }>) {
    this.logger.verbose("Processor processing queue");
    const { accessToken, type } = job.data;
    if (type === 'gmail') {
      this.logger.verbose("Processor processing queue successfully");
      await this.emailService.parseGmail(accessToken);
    } else if (type === 'outlook') {
      // await this.emailService.parseOutlook(accessToken);
    }
  }
}
