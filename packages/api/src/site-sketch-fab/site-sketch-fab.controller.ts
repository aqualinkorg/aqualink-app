import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteSketchFabService } from './site-sketch-fab.service';
import { FindSketchFabDto } from './dto/find-sketch-fab.dto';

@ApiTags('site-sketch-fab')
@Controller('site-sketch-fab')
export class SiteSketchFabController {
  constructor(private siteSketchFab: SiteSketchFabService) {}

  @Get()
  find(@Query() findSketchFabDto: FindSketchFabDto) {
    return this.siteSketchFab.find(findSketchFabDto);
  }
}
