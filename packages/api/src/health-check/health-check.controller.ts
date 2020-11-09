import { Controller, Get } from '@nestjs/common';

@Controller('health-check')
export class HealthCheckController {
  @Get()
  healthCheck() {
    return { status: 200 };
  }
}
