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
import { ReefApplicationsService } from './reef-applications.service';
import { ReefApplication } from './reef-applications.entity';
import { UpdateReefApplicationDto } from './dto/update-reef-application.dto';
import { Auth } from '../auth/auth.decorator';
import { IsReefAdminGuard } from '../auth/is-reef-admin.guard';
import { ParseHashedIdPipe } from '../pipes/parse-hashed-id.pipe';
import { OverrideLevelAccess } from '../auth/override-level-access.decorator';
import { AdminLevel } from '../users/users.entity';
import { ApiNestNotFoundResponse } from '../docs/api-response';
import { ApiUpdateReefApplicationBody } from '../docs/api-properties';

@ApiTags('ReefApplications')
@Auth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('reef-applications')
@SerializeOptions({
  excludePrefixes: ['id', 'createdAt', 'updatedAt', 'adminLevel'],
})
export class ReefApplicationsController {
  constructor(private reefApplicationsService: ReefApplicationsService) {}

  @ApiBearerAuth()
  @ApiNestNotFoundResponse('No reef application for specified reef was found')
  @ApiOperation({ summary: 'Returns reef application of specified reef' })
  @ApiParam({ name: 'reef_id', example: 1 })
  @OverrideLevelAccess(AdminLevel.SuperAdmin, AdminLevel.ReefManager)
  @UseGuards(IsReefAdminGuard)
  @Get('/reefs/:reef_id')
  async findOneFromReef(
    @Param('reef_id') reefId: number,
  ): Promise<ReefApplication> {
    return this.reefApplicationsService.findOneFromReef(reefId);
  }

  @ApiBearerAuth()
  @ApiUpdateReefApplicationBody()
  @ApiOperation({
    summary:
      'Updates reef application by providing its appId. Needs authentication.',
  })
  @ApiParam({ name: 'appId', example: 1 })
  @UseGuards(IsReefAdminGuard)
  @Put(':appId/reefs/:reef_id')
  update(
    @Param('appId', new ParseHashedIdPipe()) id: number,
    @Body() reefApplication: UpdateReefApplicationDto,
  ) {
    return this.reefApplicationsService.update(id, reefApplication);
  }
}
