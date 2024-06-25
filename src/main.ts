import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);


  const logger = new Logger('bootstrap');

  await app.listen(configService.get('PORT'), () => {
    return logger.log(`🚀 Server running on port ${configService.get('PORT')}`);
  });
}
bootstrap();
