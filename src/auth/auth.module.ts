import { Logger, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TasksModule } from 'src/tasks/tasks.module';
import { TasksService } from 'src/tasks/tasks.service';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [
    TasksModule, 
  ],
  providers: [AuthService, Logger, TasksService, EmailService],
  controllers: [AuthController,]
})
export class AuthModule {}
