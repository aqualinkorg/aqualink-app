import { Controller, Get, Logger, Redirect } from '@nestjs/common';

@Controller('')
export class AppController {
  private readonly logger = new Logger(AppController.name);

  @Get()
  @Redirect('/api/docs')
  getDocs() {
    this.logger.log('Redirecting to /api/docs');
  }
}
