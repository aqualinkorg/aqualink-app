import { Controller, Get } from '@nestjs/common';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { GoogleCloudService } from './google-cloud.service';

@Auth(AdminLevel.SuperAdmin)
@Controller('google-cloud')
export class GoogleCloudController {
  constructor(private googleCloudService: GoogleCloudService) {}

  @Get()
  findDanglingFiles() {
    return this.googleCloudService.findDanglingFiles();
  }
}
