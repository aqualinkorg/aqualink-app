import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReefsModule } from './reefs/reefs.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    ReefsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
