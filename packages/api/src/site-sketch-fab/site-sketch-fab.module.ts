import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSketchFabService } from './site-sketch-fab.service';
import { SiteSketchFabController } from './site-sketch-fab.controller';
import { SketchFab } from './site-sketch-fab.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SketchFab])],
  providers: [SiteSketchFabService],
  controllers: [SiteSketchFabController],
})
export class SiteSketchFabModule {}
