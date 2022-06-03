import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteSketchFabService } from './site-sketchfab.service';
import { SiteSketchFabController } from './site-sketchfab.controller';
import { SketchFab } from './site-sketchfab.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SketchFab])],
  providers: [SiteSketchFabService],
  controllers: [SiteSketchFabController],
})
export class SiteSketchFabModule {}
