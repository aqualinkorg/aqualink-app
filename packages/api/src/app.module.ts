import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { ReefApplicationsModule } from './reef-applications/reef-applications.module';
import { ReefsModule } from './reefs/reefs.module';
import { RegionsModule } from './regions/regions.module';

@Module({
  imports: [
    ReefApplicationsModule,
    ReefsModule,
    RegionsModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
  ],
})
export class AppModule { }
