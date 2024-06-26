import { Body, Controller, Get, Logger, Param, Post } from '@nestjs/common';
import { RedisService } from './redis.service';

@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly redisService: RedisService) {}

  @Get('redis')
  async checkRedis() {
    const isConnected = await this.redisService.checkConnection();
    return isConnected ? 'Redis is connected and working' : 'Redis connection failed';
  }

  @Post('set')
  async setValue(@Body() body: { key: string, value: string }) {
    const { key, value } = body;
    await this.redisService.setValue(key, value);
    this.logger.log(`Set key ${key} with value ${value}`);
    return 'Value set successfully';
  }

  @Get('get/:key')
  async getValue(@Param('key') key: string) {
    const value = await this.redisService.getValue(key);
    this.logger.log(`Get key ${key} returned value ${value}`);
    return value ? value : 'Key not found';
  }
}
