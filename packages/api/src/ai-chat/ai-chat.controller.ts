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

interface AiChatRequest {
  message: string;
  siteId: number;
  conversationHistory?: Array<{
    sender: 'user' | 'assistant';
    text: string;
  }>;
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
    const { message, siteId, conversationHistory } = body;

    // Validate input
    if (!message || !message.trim()) {
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
      );

      this.logger.log(`AI response generated for site ${siteId}`);

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
}
