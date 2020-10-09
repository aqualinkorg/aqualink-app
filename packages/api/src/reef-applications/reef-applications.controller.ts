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
  ParseIntPipe,
} from '@nestjs/common';
import { ReefApplicationsService } from './reef-applications.service';
import { ReefApplication } from './reef-applications.entity';
import { UpdateReefApplicationDto } from './dto/update-reef-application.dto';
import { idFromHash, isValidId } from '../utils/urls';
import { Auth } from '../auth/auth.decorator';
import {
  CreateReefApplicationDto,
  CreateReefWithApplicationDto,
} from './dto/create-reef-application.dto';
import { Public } from '../auth/public.decorator';
import { AuthRequest } from '../auth/auth.types';

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
  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() reefApplication: UpdateReefApplicationDto,
  ) {
    return this.reefApplicationsService.update(id, reefApplication);
  }
}
