import { Controller, Param, Get } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ReefCheckSitesService } from './reef-check-sites.service';
import { Public } from '../auth/public.decorator';
import { ApiNestNotFoundResponse } from '../docs/api-response';
import { ReefCheckSite } from './reef-check-sites.entity';

@ApiTags('Reef Check Sites')
@Controller('reef-check-sites')
export class ReefCheckSitesController {
  constructor(private sitesService: ReefCheckSitesService) {}

  @ApiNestNotFoundResponse('No reef check site was found with the specified id')
  @ApiOperation({ summary: 'Returns specified reef check site' })
  @ApiParam({ name: 'id', example: '12345678-abcd-efgh-12345678' })
  @Public()
  @Get(':id')
  findOne(@Param('id') id: string): Promise<ReefCheckSite> {
    return this.sitesService.findOne(id);
  }
}
