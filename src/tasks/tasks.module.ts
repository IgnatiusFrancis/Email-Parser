import { Logger, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { EmailModule } from '../email/email.module';
import { TasksProcessor } from './tasks.processor';
import { EmailService } from 'src/email/email.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'email',
    }),
    EmailModule,
  ],
  providers: [TasksService, EmailService, TasksProcessor, Logger,RedisService],
  exports: [BullModule,RedisService],
})
export class TasksModule {}
