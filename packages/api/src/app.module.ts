import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { ReefsModule } from './reefs/reefs.module';
import { ReefApplicationsModule } from './reef-applications/reef-applications.module';
import { RegionsModule } from './regions/regions.module';

@Module({
  imports: [
    ReefsModule,
    ReefApplicationsModule,
    RegionsModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
  ],
})
export class AppModule {}
