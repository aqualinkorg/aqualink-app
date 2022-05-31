import { Module } from '@nestjs/common';
import { SiteSketchFabService } from './site-sketch-fab.service';
import { SiteSketchFabController } from './site-sketch-fab.controller';

@Module({
  providers: [SiteSketchFabService],
  controllers: [SiteSketchFabController],
})
export class SiteSketchFabModule {}
