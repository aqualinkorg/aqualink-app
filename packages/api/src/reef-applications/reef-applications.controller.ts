import {
  Controller,
  Body,
  Param,
  Get,
  Put,
  UseInterceptors,
  ClassSerializerInterceptor,
  SerializeOptions,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ReefApplicationsService } from './reef-applications.service';
import { ReefApplication } from './reef-applications.entity';
import {
  UpdateReefApplicationDto,
  UpdateReefWithApplicationDto,
} from './dto/update-reef-application.dto';
import { idFromHash, isValidId } from '../utils/urls';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('reef-applications')
@SerializeOptions({
  excludePrefixes: ['id', 'createdAt', 'updatedAt', 'adminLevel'],
})
export class ReefApplicationsController {
  constructor(private reefApplicationsService: ReefApplicationsService) {}

  @Get(':id')
  async findOne(
    @Param('id') idParam: string,
    @Query('uid') uid: string,
  ): Promise<ReefApplication> {
    // To maintain backward compatibility, the ID can either be a numeric key or a unique encoded value.
    const isIntId = isValidId(idParam);
    const id = isIntId ? idFromHash(idParam) : parseInt(idParam, 10);
    const app = await this.reefApplicationsService.findOne(id);
    if (isIntId && app.uid !== uid) {
      throw new NotFoundException(`Reef Application with ID ${id} not found.`);
    }
    return app;
  }

  @Put(':id')
  update(
    @Param('id') hashedId: string,
    @Body('reefApplication') reefApplication: UpdateReefApplicationDto,
    @Body('reef') reef: UpdateReefWithApplicationDto,
  ) {
    const id = idFromHash(hashedId);
    return this.reefApplicationsService.update(id, reefApplication, reef);
  }
}
