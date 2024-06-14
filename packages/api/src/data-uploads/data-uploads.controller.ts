import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Auth } from '../auth/auth.decorator';
import { IsSiteAdminGuard } from '../auth/is-site-admin.guard';
import { SiteDataRangeDto } from '../time-series/dto/site-data-range.dto';
import { AdminLevel } from '../users/users.entity';
import { DataUploadsService } from './data-uploads.service';
import { DataUploadsDeleteDto } from './dto/data-uploads-delete.dto';

@ApiTags('Data Uploads')
@Controller('data-uploads')
export class DataUploadsController {
  constructor(private dataUploadsService: DataUploadsService) {}

  @ApiOperation({ summary: "Find all data uploads for a site's survey point" })
  @Get('sites/:siteId')
  getDataUploads(@Param() params: SiteDataRangeDto) {
    return this.dataUploadsService.getDataUploads(params);
  }

  @ApiOperation({ summary: 'Delete selected data uploads' })
  @UseGuards(IsSiteAdminGuard)
  @Auth(AdminLevel.SiteManager, AdminLevel.SuperAdmin)
  @Post('sites/:siteId/delete-uploads')
  DeleteDataUploads(@Body() dataUploadsDeleteDto: DataUploadsDeleteDto) {
    return this.dataUploadsService.deleteDataUploads(dataUploadsDeleteDto);
  }
}
