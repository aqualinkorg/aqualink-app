import { Controller, Delete, Get } from '@nestjs/common';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { GoogleCloudService } from './google-cloud.service';

@Auth(AdminLevel.SuperAdmin)
@Controller('google-cloud')
export class GoogleCloudController {
  constructor(private googleCloudService: GoogleCloudService) {}

  @Get()
  findDanglingFiles(): Promise<string[]> {
    return this.googleCloudService.findDanglingFiles();
  }

  @Delete()
  DeleteDanglingFiles(): Promise<void[]> {
    return this.googleCloudService.deleteDanglingFiles();
  }
}
