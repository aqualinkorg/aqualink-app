import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SurveyPointDataRangeDto } from '../time-series/dto/survey-point-data-range.dto';
import { DataUploadsService } from './data-uploads.service';

@ApiTags('Data Uploads')
@Controller('data-uploads')
export class DataUploadsController {
  constructor(private dataUploadsService: DataUploadsService) {}

  @ApiOperation({ summary: "Find all data uploads for a site's survey point" })
  @Get('sites/:siteId/site-survey-points/:surveyPointId')
  getDataUploads(@Param() params: SurveyPointDataRangeDto) {
    return this.dataUploadsService.getDataUploads(params);
  }
}
