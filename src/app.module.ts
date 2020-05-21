import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ReefsModule } from './reefs/reefs.module';

@Module({
  imports: [ReefsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
