import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SitePoisController } from './site-pois.controller';
import { SitePoisService } from './site-pois.service';
import { SitePointOfInterest } from './site-pois.entity';
import { EntityExists } from '../validations/entity-exists.constraint';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([SitePointOfInterest])],
  controllers: [SitePoisController],
  providers: [SitePoisService, EntityExists],
})
export class SitePoisModule {}
