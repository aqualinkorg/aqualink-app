import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteDataRangeDto } from '../time-series/dto/site-data-range.dto';
import { DataUploadsService } from './data-uploads.service';

@ApiTags('Data Uploads')
@Controller('data-uploads')
export class DataUploadsController {
  constructor(private dataUploadsService: DataUploadsService) {}

  @ApiOperation({ summary: "Find all data uploads for a site's survey point" })
  @Get('sites/:siteId')
  getDataUploads(@Param() params: SiteDataRangeDto) {
    return this.dataUploadsService.getDataUploads(params);
  }
}
