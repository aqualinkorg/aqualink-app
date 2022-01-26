import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataUploadsController } from './data-uploads.controller';
import { DataUploads } from './data-uploads.entity';
import { DataUploadsService } from './data-uploads.service';

@Module({
  imports: [TypeOrmModule.forFeature([DataUploads])],
  controllers: [DataUploadsController],
  providers: [DataUploadsService],
})
export class DataUploadsModule {}
