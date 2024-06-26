import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TasksModule } from 'src/tasks/tasks.module';
import { TasksService } from 'src/tasks/tasks.service';
import { EmailService } from 'src/email/email.service';
import { RedisService } from 'src/tasks/redis.service';


@Module({
  providers: [AuthService, Logger, EmailService, TasksService],
  controllers: [AuthController,]
})
export class AuthModule {}
