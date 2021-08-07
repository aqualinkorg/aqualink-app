import { Controller, Get, Logger, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller('')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @ApiExcludeEndpoint()
  @Get()
  @Redirect('/api/docs')
  getDocs() {
    this.logger.log('Redirecting to /api/docs');
  }
}
