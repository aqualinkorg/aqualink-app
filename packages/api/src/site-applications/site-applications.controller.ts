import {
  Controller,
  Body,
  Param,
  Get,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiParam,
} from '@nestjs/swagger';
import { SiteApplicationsService } from './site-applications.service';
import { SiteApplication } from './site-applications.entity';
import { UpdateSiteApplicationDto } from './dto/update-site-application.dto';
import { Auth } from '../auth/auth.decorator';
import { IsSiteAdminGuard } from '../auth/is-site-admin.guard';
import { ParseHashedIdPipe } from '../pipes/parse-hashed-id.pipe';
import { OverrideLevelAccess } from '../auth/override-level-access.decorator';
import { AdminLevel } from '../users/users.entity';
import { ApiNestNotFoundResponse } from '../docs/api-response';
import { ApiUpdateSiteApplicationBody } from '../docs/api-properties';

@ApiTags('SiteApplications')
@Auth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('site-applications')
@SerializeOptions({
  excludePrefixes: ['id', 'createdAt', 'updatedAt', 'adminLevel'],
})
export class SiteApplicationsController {
  constructor(private siteApplicationsService: SiteApplicationsService) {}

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No site application for specified site was found')
  @ApiOperation({ summary: 'Returns site application of specified site' })
  @ApiParam({ name: 'site_id', example: 1 })
  @OverrideLevelAccess(AdminLevel.SuperAdmin, AdminLevel.SiteManager)
  @UseGuards(IsSiteAdminGuard)
  @Get('/sites/:site_id')
  async findOneFromSite(
    @Param('site_id') siteId: number,
  ): Promise<SiteApplication> {
    return this.siteApplicationsService.findOneFromSite(siteId);
  }

  @ApiBearerAuth()
  @ApiUpdateSiteApplicationBody()
  @ApiOperation({
    summary:
      'Updates site application by providing its appId. Needs authentication.',
  })
  @ApiParam({ name: 'appId', example: 1 })
  @UseGuards(IsSiteAdminGuard)
  @Put(':appId/sites/:site_id')
  update(
    @Param('appId', new ParseHashedIdPipe()) id: number,
    @Body() siteApplication: UpdateSiteApplicationDto,
  ) {
    return this.siteApplicationsService.update(id, siteApplication);
  }
}
