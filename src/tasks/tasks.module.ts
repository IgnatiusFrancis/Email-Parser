import { Global, Logger, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { TasksService } from './tasks.service';
import { EmailModule } from '../email/email.module';
import { TasksProcessor } from './tasks.processor';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';
import { HealthController } from './health.controller';
import { EmailService } from 'src/email/email.service';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'emailParser',
      // redis: {
      //   host: process.env.QUEUE_HOST,
      //   port: 6379,
      // },
    }),
    EmailModule,
  ],
  providers: [TasksService, TasksProcessor, Logger, RedisService, EmailService],
  controllers: [HealthController],
  exports: [BullModule, RedisService],
})
export class TasksModule {}
