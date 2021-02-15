import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Query,
  NotFoundException,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ReefApplicationsService } from './reef-applications.service';
import { ReefApplication } from './reef-applications.entity';
import {
  UpdateReefApplicationDto,
  UpdateReefWithApplicationDto,
} from './dto/update-reef-application.dto';
import { idFromHash, isValidId } from '../utils/urls';
import { Auth } from '../auth/auth.decorator';
import {
  CreateReefApplicationDto,
  CreateReefWithApplicationDto,
} from './dto/create-reef-application.dto';
import { Public } from '../auth/public.decorator';
import { AuthRequest } from '../auth/auth.types';
import { IsReefAdminGuard } from '../auth/is-reef-admin.guard';
import { ParseHashedIdPipe } from '../pipes/parse-hashed-id.pipe';
import { OverrideLevelAccess } from '../auth/override-level-access.decorator';
import { AdminLevel } from '../users/users.entity';

@Auth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('reef-applications')
@SerializeOptions({
  excludePrefixes: ['id', 'createdAt', 'updatedAt', 'adminLevel'],
})
export class ReefApplicationsController {
  constructor(private reefApplicationsService: ReefApplicationsService) {}

  @Post()
  async create(
    @Req() request: AuthRequest,
    @Body('reefApplication') reefApplication: CreateReefApplicationDto,
    @Body('reef') reef: CreateReefWithApplicationDto,
  ): Promise<ReefApplication> {
    return this.reefApplicationsService.create(
      reefApplication,
      reef,
      request.user,
    );
  }

  @OverrideLevelAccess(AdminLevel.SuperAdmin, AdminLevel.ReefManager)
  @UseGuards(IsReefAdminGuard)
  @Get('/reefs/:reef_id')
  async findOneFromReef(
    @Param('reef_id') reefId: number,
  ): Promise<ReefApplication> {
    return this.reefApplicationsService.findOneFromReef(reefId);
  }

  @Public()
  @Get(':id')
  async findOne(
    @Param('id') idParam: string,
    @Query('uid') uid: string,
  ): Promise<ReefApplication> {
    // To maintain backward compatibility, the ID can either be a numeric key or a unique encoded value.
    const isIntId = isValidId(idParam);
    const id = isIntId ? parseInt(idParam, 10) : idFromHash(idParam);
    const app = await this.reefApplicationsService.findOne(id);
    if (isIntId && app.uid !== uid) {
      throw new NotFoundException(`Reef Application with ID ${id} not found.`);
    }
    return app;
  }

  @Public()
  @Put(':hashId')
  updateWithHash(
    @Param('hashId', new ParseHashedIdPipe()) id: number,
    @Body('reefApplication') reefApplication: UpdateReefApplicationDto,
    @Body('reef') reef: UpdateReefWithApplicationDto,
  ) {
    return this.reefApplicationsService.update(id, reefApplication, reef);
  }

  @UseGuards(IsReefAdminGuard)
  @Put(':hashId/reefs/:reef_id')
  update(
    @Param('hashId', new ParseHashedIdPipe()) id: number,
    @Body() reefApplication: UpdateReefApplicationDto,
  ) {
    return this.reefApplicationsService.update(id, reefApplication, {});
  }
}
