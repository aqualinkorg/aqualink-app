import { Controller, Delete, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { getConnection } from 'typeorm';
import { Auth } from '../auth/auth.decorator';
import { Public } from '../auth/public.decorator';
import { AdminLevel } from '../users/users.entity';
import { checkVideoStreams } from '../workers/check-video-streams';
import { GoogleCloudService } from './google-cloud.service';

@ApiTags('Google Cloud Storage')
@Auth(AdminLevel.SuperAdmin)
@Controller('google-cloud')
export class GoogleCloudController {
  constructor(private googleCloudService: GoogleCloudService) {}

  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'An array of all dangling files',
    schema: {
      type: 'array',
      items: {
        type: 'string',
        example:
          'https://storage.googleapis.com/storage/reef-image-a5b5f5c5d5da5d5e.jpg',
      },
    },
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

  @Public()
  @Get()
  checkVideo() {
    checkVideoStreams(getConnection(), process.env.PROJECT_ID!);
  }
}
