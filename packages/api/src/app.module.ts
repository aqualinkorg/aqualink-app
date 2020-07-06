import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configService } from './config/config.service';
import { ReefApplicationsModule } from './reef-applications/reef-applications.module';

@Module({
  imports: [
    ReefApplicationsModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
  ],
})
export class AppModule {}
