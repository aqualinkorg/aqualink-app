import { Controller, Param, Get } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ReefCheckSurveysService } from './reef-check-surveys.service';
import { Public } from '../auth/public.decorator';
import { ApiNestNotFoundResponse } from '../docs/api-response';
import { ReefCheckSurvey } from './reef-check-surveys.entity';

@ApiTags('Reef Check Surveys')
@Controller('reef-check-sites/:reefCheckSiteId/surveys')
export class ReefCheckSurveysController {
  constructor(private surveysService: ReefCheckSurveysService) {}

  @ApiOperation({ summary: "Returns all reef check site's survey" })
  @ApiParam({ name: 'reefCheckSiteId', example: '12345678-abcd-efgh-12345678' })
  @Public()
  @Get()
  find(
    @Param('reefCheckSiteId') reefCheckSiteId: string,
  ): Promise<ReefCheckSurvey[]> {
    return this.surveysService.find(reefCheckSiteId);
  }

  @ApiNestNotFoundResponse(
    'No reef check survey was found with the specified id',
  )
  @ApiOperation({ summary: 'Returns specified reef check survey' })
  @ApiParam({ name: 'id', example: '12345678-abcd-efgh-12345678' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ReefCheckSurvey> {
    return this.surveysService.findOne(id);
  }
}
