import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AIPrompt } from './ai-prompt.entity';
import { AIPromptHistory } from './ai-prompt-history.entity';

export interface AIPromptResponse {
  id: number;
  promptKey: string;
  content: string;
  description: string | null;
  category: string | null;
  version: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string | null;
  changeNotes: string | null;
}

export interface AIPromptHistoryResponse {
  id: number;
  promptId: number;
  promptKey: string;
  content: string;
  version: number;
  changedAt: Date;
  changedBy: string | null;
  changeNotes: string | null;
}

@Injectable()
export class AiPromptsService {
  private logger = new Logger(AiPromptsService.name);
  private cache: AIPromptResponse[] | null = null;

  constructor(
    @InjectRepository(AIPrompt)
    private aiPromptRepository: Repository<AIPrompt>,

    @InjectRepository(AIPromptHistory)
    private aiPromptHistoryRepository: Repository<AIPromptHistory>,
  ) {}

  private toPromptResponse(prompt: AIPrompt): AIPromptResponse {
    return {
      id: prompt.id,
      promptKey: prompt.promptKey,
      content: prompt.content,
      description: prompt.description,
      category: prompt.category,
      version: prompt.version,
      isActive: prompt.isActive,
      createdAt: prompt.createdAt,
      updatedAt: prompt.updatedAt,
      updatedBy: prompt.updatedByUser?.email ?? null,
      changeNotes: prompt.changeNotes,
    };
  }

  private toHistoryResponse(entry: AIPromptHistory): AIPromptHistoryResponse {
    return {
      id: entry.id,
      promptId: entry.promptId,
      promptKey: entry.promptKey,
      content: entry.content,
      version: entry.version,
      changedAt: entry.changedAt,
      changedBy: entry.changedByUser?.email ?? null,
      changeNotes: entry.changeNotes,
    };
  }

  async getAllPrompts(): Promise<AIPromptResponse[]> {
    // If we have cached data, return it (no expiry)
    if (this.cache) {
      this.logger.debug('Returning cached prompts');
      return this.cache;
    }

    // Fetch fresh data
    const prompts = await this.aiPromptRepository.find({
      where: { isActive: true },
      relations: ['updatedByUser'],
      order: { promptKey: 'ASC' },
    });

    const response = prompts.map((prompt) => this.toPromptResponse(prompt));

    // Cache prompts (persists until manually cleared)
    this.cache = response;
    this.logger.debug(`Loaded and cached ${response.length} prompts`);

    return response;
  }

  async getPromptByKey(promptKey: string): Promise<AIPromptResponse> {
    const prompt = await this.aiPromptRepository.findOne({
      where: { promptKey, isActive: true },
      relations: ['updatedByUser'],
    });

    if (!prompt) {
      throw new NotFoundException(`Prompt with key '${promptKey}' not found`);
    }

    return this.toPromptResponse(prompt);
  }

  private async findPromptEntity(promptKey: string): Promise<AIPrompt> {
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
  ): Promise<AIPromptResponse> {
    const prompt = await this.findPromptEntity(promptKey);

    // Update prompt (avoid mutation)
    const updated = await this.aiPromptRepository.save({
      ...prompt,
      content,
      version: prompt.version + 1,
      updatedBy,
      changeNotes,
    });

    const withUser = await this.aiPromptRepository.findOne({
      where: { id: updated.id },
      relations: ['updatedByUser'],
    });

    // Invalidate cache - next request will reload
    this.cache = null;
    this.logger.log(
      `Updated prompt '${promptKey}' to version ${updated.version}`,
    );

    return this.toPromptResponse(withUser!);
  }

  async getPromptHistory(
    promptKey: string,
  ): Promise<AIPromptHistoryResponse[]> {
    const prompt = await this.findPromptEntity(promptKey);

    const history = await this.aiPromptHistoryRepository.find({
      where: { promptId: prompt.id },
      relations: ['changedByUser'],
      order: { version: 'DESC' },
    });

    return history.map((entry) => this.toHistoryResponse(entry));
  }

  async rollbackToVersion(
    promptKey: string,
    version: number,
    updatedBy: number | null,
  ): Promise<AIPromptResponse> {
    const prompt = await this.findPromptEntity(promptKey);

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

    const withUser = await this.aiPromptRepository.findOne({
      where: { id: updated.id },
      relations: ['updatedByUser'],
    });

    // Invalidate cache - next request will reload
    this.cache = null;
    this.logger.log(
      `Rolled back prompt '${promptKey}' to version ${version} (now version ${updated.version})`,
    );

    return this.toPromptResponse(withUser!);
  }

  refreshCache(): void {
    this.cache = null;
    this.logger.log('Cache manually cleared - will reload on next request');
  }
}
