import {
  Controller,
  Body,
  Param,
  Get,
  Post,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ReefApplicationsService } from './reef-applications.service';
import { ReefApplication } from './reef-applications.entity';
import { CreateReefApplicationDto } from './dto/create-reef-application.dto';
import { CreateReefDto } from '../reefs/dto/create-reef.dto';

@Controller('reef-applications')
export class ReefApplicationsController {
  constructor(private reefApplicationsService: ReefApplicationsService) {}

  @Post()
  create(
    @Body('reefApplication') createReefApplicationDto: CreateReefApplicationDto,
    @Body('reef') createReefDto: CreateReefDto,
  ): Promise<ReefApplication> {
    return this.reefApplicationsService.create(
      createReefApplicationDto,
      createReefDto,
    );
  }

  @Get(':id')
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Query('uid') uid: string,
  ): Promise<ReefApplication> {
    return this.reefApplicationsService.findOne(id, uid);
  }
}
