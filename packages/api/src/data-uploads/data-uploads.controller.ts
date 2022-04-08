import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SiteDataRangeDto } from '../time-series/dto/site-data-range.dto';
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
  @Post('delete-uploads')
  DeleteDataUploads(@Body() dataUploadsDeleteDto: DataUploadsDeleteDto) {
    return this.dataUploadsService.deleteDataUploads(dataUploadsDeleteDto);
  }
}
