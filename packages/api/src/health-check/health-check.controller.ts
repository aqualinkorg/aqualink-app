import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health Check')
@Controller('health-check')
export class HealthCheckController {
  @ApiOperation({ summary: 'Checks if the backend is up and running.' })
  @Get()
  healthCheck() {
    return { status: 200 };
  }
}
