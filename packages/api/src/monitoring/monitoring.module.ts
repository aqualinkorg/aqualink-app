import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { Site } from '../sites/sites.entity';
import { Survey } from '../surveys/surveys.entity';
import { LatestData } from '../time-series/latest-data.entity';
import { User } from '../users/users.entity';
import { MonitoringController } from './monitoring.controller';
import { Monitoring } from './monitoring.entity';
import { MonitoringService } from './monitoring.service';
import { PromptsController } from './ai-prompts.controller';
import { AiPromptsService } from './ai-prompts.service';
import { AIPrompt } from './ai-prompt.entity';
import { AIPromptHistory } from './ai-prompt-history.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Monitoring,
      User,
      Site,
      Survey,
      LatestData,
      SiteApplication,
      AIPrompt,
      AIPromptHistory,
    ]),
  ],
  controllers: [MonitoringController, PromptsController],
  providers: [MonitoringService, AiPromptsService],
  exports: [AiPromptsService],
})
export class MonitoringModule {}
