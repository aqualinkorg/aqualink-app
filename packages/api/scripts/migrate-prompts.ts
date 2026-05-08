import { NestFactory } from '@nestjs/core';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AppModule } from '../src/app.module';
import { AIPrompt } from '../src/monitoring/ai-prompt.entity';

// Import prompts from existing TypeScript files
import { SYSTEM_PROMPT } from '../src/utils/prompts/system';
import { GUARDRAILS } from '../src/utils/prompts/guardrails';
import { INITIAL_GREETING } from '../src/utils/prompts/greeting';
import { DATA_GUIDE } from '../src/utils/prompts/data-guide';
import { SURVEY_GUIDE } from '../src/utils/prompts/survey-guide';
import { BLEACHING_RESPONSE_GUIDE } from '../src/utils/prompts/bleaching-response';
import { FAQ_KNOWLEDGE } from '../src/utils/prompts/faq';
import { README_KNOWLEDGE } from '../src/utils/prompts/readme-knowledge';

interface PromptData {
  promptKey: string;
  content: string;
  description: string;
  category: string;
}

const PROMPTS_TO_MIGRATE: PromptData[] = [
  {
    promptKey: 'system',
    content: SYSTEM_PROMPT,
    description: 'Core system prompt defining AI identity and behavior',
    category: 'core',
  },
  {
    promptKey: 'guardrails',
    content: GUARDRAILS,
    description: 'Scope boundaries and what AI can/cannot answer',
    category: 'core',
  },
  {
    promptKey: 'greeting',
    content: INITIAL_GREETING,
    description: 'Initial conversation greeting template',
    category: 'greeting',
  },
  {
    promptKey: 'data-guide',
    content: DATA_GUIDE,
    description: 'Technical data sources and API documentation',
    category: 'knowledge',
  },
  {
    promptKey: 'survey-guide',
    content: SURVEY_GUIDE,
    description: 'How to conduct Aqualink surveys',
    category: 'knowledge',
  },
  {
    promptKey: 'bleaching-response',
    content: BLEACHING_RESPONSE_GUIDE,
    description: 'Emergency bleaching protocols',
    category: 'knowledge',
  },
  {
    promptKey: 'faq',
    content: FAQ_KNOWLEDGE,
    description: 'FAQ knowledge from aqualink.org/faq',
    category: 'knowledge',
  },
  {
    promptKey: 'readme-knowledge',
    content: README_KNOWLEDGE,
    description: 'Repository documentation',
    category: 'knowledge',
  },
];

async function migratePrompts() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const promptRepository = app.get<Repository<AIPrompt>>(
    getRepositoryToken(AIPrompt),
  );

  console.log('Starting prompt migration...');

  // Check existing prompts first
  const existingPrompts = await promptRepository.find({
    select: ['promptKey'],
  });
  const existingKeys = new Set(existingPrompts.map((p) => p.promptKey));

  // Filter out already existing prompts
  const promptsToCreate = PROMPTS_TO_MIGRATE.filter(
    (promptData) => !existingKeys.has(promptData.promptKey),
  );

  if (promptsToCreate.length === 0) {
    console.log('All prompts already exist, skipping migration');
    await app.close();
    return;
  }

  // Create all prompts
  const newPrompts = promptsToCreate.map((promptData) =>
    promptRepository.create({
      promptKey: promptData.promptKey,
      content: promptData.content,
      description: promptData.description,
      category: promptData.category,
      version: 1,
      isActive: true,
      updatedBy: null,
      changeNotes: 'Initial migration from TypeScript files',
    }),
  );

  await promptRepository.save(newPrompts);

  newPrompts.forEach((prompt) => {
    console.log(`✓ Migrated prompt '${prompt.promptKey}'`);
  });

  console.log('\nMigration complete!');
  console.log(`Total prompts in database: ${await promptRepository.count()}`);

  await app.close();
}

migratePrompts().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
