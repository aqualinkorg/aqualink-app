import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Public } from 'auth/public.decorator';
import { MetadataService } from './metadata.service';

@ApiTags('Metadata')
@Controller('metadata')
export class MetadataController {
  constructor(private metadataService: MetadataService) {}

  @Public()
  @Get('sites')
  async getSites() {
    return this.metadataService.getSites();
  }

  @Public()
  @Get('site-points')
  async getSitePoints() {
    return this.metadataService.getSitePoints();
  }

  @Public()
  @Get('surveys')
  async getSurveys() {
    return this.metadataService.getSurveys();
  }

  @Public()
  @Get('reef-check-surveys')
  async getReefCheckSurveys() {
    return this.metadataService.getReefCheckSurveys();
  }
}
