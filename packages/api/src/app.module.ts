import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { ReefsModule } from './reefs/reefs.module';
import { RegionsModule } from './regions/regions.module';
import { configService } from './config/config.service';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    ReefsModule,
    RegionsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
