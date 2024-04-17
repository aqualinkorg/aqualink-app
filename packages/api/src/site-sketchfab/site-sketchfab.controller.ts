import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SiteSketchFabService } from './site-sketchfab.service';
import { FindSketchFabDto } from './dto/find-sketchfab.dto';

// NOTE: no longer used in webapp
@ApiTags('site-sketchfab')
@Controller('site-sketchfab')
export class SiteSketchFabController {
  constructor(private siteSketchFab: SiteSketchFabService) {}

  @Get()
  find(@Query() findSketchFabDto: FindSketchFabDto) {
    return this.siteSketchFab.find(findSketchFabDto);
  }
}
