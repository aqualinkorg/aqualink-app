import {
  Controller,
  Body,
  Param,
  Get,
  Put,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReefApplicationsService } from './reef-applications.service';
import { ReefApplication } from './reef-applications.entity';
import {
  UpdateReefApplicationDto,
  UpdateReefWithApplicationDto,
} from './dto/update-reef-application.dto';

@Controller('reef-applications')
export class ReefApplicationsController {
  constructor(private reefApplicationsService: ReefApplicationsService) {}

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('uid') uid: string,
  ): Promise<ReefApplication> {
    return this.reefApplicationsService.findOne(id, uid);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body('uid') uid: string,
    @Body('reefApplication') reefApplication: UpdateReefApplicationDto,
    @Body('reef') reef: UpdateReefWithApplicationDto,
  ) {
    return this.reefApplicationsService.update(id, uid, reefApplication, reef);
  }
}
