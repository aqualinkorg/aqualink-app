import { Controller, Delete, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { GoogleCloudService } from './google-cloud.service';

@ApiTags('Google Cloud Storage')
@Auth(AdminLevel.SuperAdmin)
@Controller('google-cloud')
export class GoogleCloudController {
  constructor(private googleCloudService: GoogleCloudService) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'An array of all dangling files',
    type: [String],
  })
  @ApiOperation({ summary: 'Returns all files stored that are not used' })
  @Get('dangling')
  findDanglingFiles(): Promise<string[]> {
    return this.googleCloudService.findDanglingFiles();
  }

  @ApiBearerAuth()
  @ApiOperation({ summary: 'Deletes all unused files stored' })
  @Delete('dangling')
  DeleteDanglingFiles(): Promise<void[]> {
    return this.googleCloudService.deleteDanglingFiles();
  }
}
