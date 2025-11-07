import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { buildSiteContext } from '../utils/aiSiteContextBuilder';
import { callGrokAPI } from '../utils/aiGrokService';
import { AiChatLog } from '../ai-chat-logs/ai-chat-logs.entity';

interface AiChatRequest {
  message: string;
  siteId: number;
  userId?: number;
  conversationHistory?: Array<{
    sender: 'user' | 'assistant';
    text: string;
  }>;
  isFirstMessage?: boolean;
}

interface AiChatResponse {
  response: string;
}

@ApiTags('ai-chat')
@Controller('ai-chat')
export class AiChatController {
  private readonly logger = new Logger(AiChatController.name);

  constructor(@InjectDataSource() private dataSource: DataSource) {}

  @Post()
  @ApiOperation({ summary: 'Get AI assistance for coral reef monitoring' })
  @ApiResponse({
    status: 200,
    description: 'AI response generated successfully',
  })
  @ApiResponse({ status: 400, description: 'Invalid request' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async chat(@Body() body: AiChatRequest): Promise<AiChatResponse> {
    const { message, siteId, userId, conversationHistory, isFirstMessage } =
      body;

    // Validate input
    if ((!message || !message.trim()) && !isFirstMessage) {
      throw new HttpException('Message is required', HttpStatus.BAD_REQUEST);
    }

    if (!siteId || typeof siteId !== 'number') {
      throw new HttpException(
        'Valid siteId is required',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.logger.log(
      `AI chat request for site ${siteId}: "${message.substring(0, 50)}..."`,
    );

    try {
      // Build site context from database
      const siteContext = await buildSiteContext(siteId, this.dataSource);

      // Call Grok API
      const aiResponse = await callGrokAPI(
        message,
        siteContext,
        conversationHistory,
        isFirstMessage,
      );

      this.logger.log(`AI response generated for site ${siteId}`);

      // Log the interaction (skip initial greeting)
      if (!isFirstMessage) {
        this.logInteraction(siteId, userId, message, aiResponse).catch(
          (err) => {
            const errorMessage =
              err instanceof Error ? err.message : 'Unknown error';
            this.logger.error(`Failed to log AI interaction: ${errorMessage}`);
          },
        );
      }

      return {
        response: aiResponse,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Error in AI chat: ${errorMessage}`, errorStack);

      // Handle specific errors
      if (errorMessage.includes('Site with ID')) {
        throw new HttpException('Site not found', HttpStatus.NOT_FOUND);
      }

      if (errorMessage.includes('Grok API')) {
        throw new HttpException(
          'AI service temporarily unavailable',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }

      // Generic error
      throw new HttpException(
        'Failed to generate AI response',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  private async logInteraction(
    siteId: number,
    userId: number | undefined,
    userMessage: string,
    aiResponse: string,
  ): Promise<void> {
    try {
      const logEntry = this.dataSource.getRepository(AiChatLog).create({
        siteId,
        userId: userId || null,
        userMessage,
        aiResponse,
      });

      await this.dataSource.getRepository(AiChatLog).save(logEntry);
      this.logger.debug(`Logged AI interaction for site ${siteId}`);
    } catch (error) {
      this.logger.error(
        `Error logging AI interaction: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
