import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIPrompt } from './ai-prompt.entity';
import { AIPromptHistory } from './ai-prompt-history.entity';

@Injectable()
export class AiPromptsService {
  private logger = new Logger(AiPromptsService.name);
  private cache: AIPrompt[] | null = null;

  constructor(
    @InjectRepository(AIPrompt)
    private aiPromptRepository: Repository<AIPrompt>,

    @InjectRepository(AIPromptHistory)
    private aiPromptHistoryRepository: Repository<AIPromptHistory>,
  ) {}

  async getAllPrompts(): Promise<AIPrompt[]> {
    // If we have cached data, return it (no expiry)
    if (this.cache) {
      this.logger.debug('Returning cached prompts');
      return this.cache;
    }

    // Fetch fresh data
    const prompts = await this.aiPromptRepository.find({
      where: { isActive: true },
      order: { promptKey: 'ASC' },
    });

    // Cache prompts (persists until manually cleared)
    this.cache = prompts;
    this.logger.debug(`Loaded and cached ${prompts.length} prompts`);

    return prompts;
  }

  async getPromptByKey(promptKey: string): Promise<AIPrompt> {
    const prompt = await this.aiPromptRepository.findOne({
      where: { promptKey, isActive: true },
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with key '${promptKey}' not found`);
    }

    return prompt;
  }

  async updatePrompt(
    promptKey: string,
    content: string,
    updatedBy: number | null,
    changeNotes: string | null,
  ): Promise<AIPrompt> {
    const prompt = await this.getPromptByKey(promptKey);

    // Update prompt (avoid mutation)
    const updated = await this.aiPromptRepository.save({
      ...prompt,
      content,
      version: prompt.version + 1,
      updatedBy,
      changeNotes,
    });

    // Invalidate cache - next request will reload
    this.cache = null;
    this.logger.log(
      `Updated prompt '${promptKey}' to version ${updated.version}`,
    );

    return updated;
  }

  async getPromptHistory(promptKey: string): Promise<AIPromptHistory[]> {
    const prompt = await this.getPromptByKey(promptKey);

    return this.aiPromptHistoryRepository.find({
      where: { promptId: prompt.id },
      order: { version: 'DESC' },
    });
  }

  async rollbackToVersion(
    promptKey: string,
    version: number,
    updatedBy: number | null,
  ): Promise<AIPrompt> {
    const prompt = await this.getPromptByKey(promptKey);

    const historyEntry = await this.aiPromptHistoryRepository.findOne({
      where: { promptId: prompt.id, version },
    });

    if (!historyEntry) {
      throw new NotFoundException(
        `Version ${version} not found for prompt '${promptKey}'`,
      );
    }

    // Rollback content (avoid mutation)
    const updated = await this.aiPromptRepository.save({
      ...prompt,
      content: historyEntry.content,
      version: prompt.version + 1,
      updatedBy,
      changeNotes: `Rolled back to version ${version}`,
    });

    // Invalidate cache - next request will reload
    this.cache = null;
    this.logger.log(
      `Rolled back prompt '${promptKey}' to version ${version} (now version ${updated.version})`,
    );

    return updated;
  }

  refreshCache(): void {
    this.cache = null;
    this.logger.log('Cache manually cleared - will reload on next request');
  }
}
