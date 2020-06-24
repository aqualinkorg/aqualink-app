import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { configService } from './config/config.service';
import { ReefsModule } from './reefs/reefs.module';
import { RegionsModule } from './regions/regions.module';

@Module({
  imports: [
    ReefsModule,
    RegionsModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
  ],
  controllers: [AppController],
})
export class AppModule { }
