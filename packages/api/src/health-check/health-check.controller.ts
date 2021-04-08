import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  @Get()
  healthCheck() {
    return { status: 200 };
  }
}
