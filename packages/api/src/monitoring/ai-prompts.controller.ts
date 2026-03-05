import {
  Controller,
  Get,
  Put,
  Post,
  Param,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiPromptsService } from './ai-prompts.service';
import { Auth } from '../auth/auth.decorator';
import { AdminLevel } from '../users/users.entity';
import { IsSiteAdminGuard } from '../auth/is-site-admin.guard';
import { AuthRequest } from '../auth/auth.types';

@ApiTags('Monitoring - AI Prompts')
@Controller('monitoring/prompts')
@UseGuards(IsSiteAdminGuard)
@Auth(AdminLevel.SuperAdmin)
export class PromptsController {
  constructor(private aiPromptsService: AiPromptsService) {}

  @ApiOperation({ summary: 'Get all AI prompts' })
  @Get()
  getAllPrompts() {
    return this.aiPromptsService.getAllPrompts();
  }

  @ApiOperation({ summary: 'Get a specific AI prompt by key' })
  @Get(':promptKey')
  getPrompt(@Param('promptKey') promptKey: string) {
    return this.aiPromptsService.getPromptByKey(promptKey);
  }

  @ApiOperation({ summary: 'Update an AI prompt' })
  @Put(':promptKey')
  updatePrompt(
    @Param('promptKey') promptKey: string,
    @Body('content') content: string,
    @Body('changeNotes') changeNotes: string | null,
    @Req() req: AuthRequest,
  ) {
    const updatedBy = req.user?.id || null;
    return this.aiPromptsService.updatePrompt(
      promptKey,
      content,
      updatedBy,
      changeNotes,
    );
  }

  @ApiOperation({ summary: 'Get version history for a prompt' })
  @Get(':promptKey/history')
  getPromptHistory(@Param('promptKey') promptKey: string) {
    return this.aiPromptsService.getPromptHistory(promptKey);
  }

  @ApiOperation({ summary: 'Rollback a prompt to a previous version' })
  @Post(':promptKey/rollback')
  rollbackToVersion(
    @Param('promptKey') promptKey: string,
    @Body('version') version: number,
    @Req() req: AuthRequest,
  ) {
    const updatedBy = req.user?.id || null;
    return this.aiPromptsService.rollbackToVersion(
      promptKey,
      version,
      updatedBy,
    );
  }

  @ApiOperation({ summary: 'Refresh prompt cache manually' })
  @Post('cache/refresh')
  refreshCache() {
    this.aiPromptsService.refreshCache();
    return { success: true, message: 'Cache refreshed successfully' };
  }
}
