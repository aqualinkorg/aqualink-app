import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { buildSiteContext } from './aiSiteContextBuilder';
import { callGrokAPI, ToolExecutor } from './aiGrokService';
import { assertPromptMap, PromptMap } from './prompts';
import { AiPromptsService } from '../monitoring/ai-prompts.service';
import {
  TimeSeriesAIService,
  AggregationPeriod,
} from '../time-series/timeSeriesAI.service';

export interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
}

export interface AIChatRequest {
  siteId: number;
  message: string;
  conversationHistory?: ChatMessage[];
  isFirstMessage?: boolean;
}

const VALID_AGGREGATIONS: AggregationPeriod[] = ['hourly', 'daily', 'weekly'];

@Injectable()
export class AIChatService {
  private readonly logger = new Logger(AIChatService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly timeSeriesAIService: TimeSeriesAIService,
    private readonly aiPromptsService: AiPromptsService,
  ) {}

  async chat(request: AIChatRequest): Promise<string> {
    const { siteId, message, conversationHistory, isFirstMessage } = request;

    const siteContext = await buildSiteContext(siteId, this.dataSource);
    const prompts = await this.getPromptMap();

    const toolExecutor: ToolExecutor = async (toolName, args) => {
      if (toolName === 'query_time_series') {
        return this.executeQueryTimeSeries(siteId, args);
      }
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    };

    return callGrokAPI(
      message,
      siteContext,
      prompts,
      conversationHistory,
      isFirstMessage,
      toolExecutor,
    );
  }

  private async getPromptMap(): Promise<PromptMap> {
    const allPrompts = await this.aiPromptsService.getAllPrompts();
    const partial = Object.fromEntries(
      allPrompts.map((p) => [p.promptKey, p.content]),
    );

    try {
      return assertPromptMap(partial);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(msg);
      throw new InternalServerErrorException('AI prompts are misconfigured');
    }
  }

  private async executeQueryTimeSeries(
    siteId: number,
    args: Record<string, unknown>,
  ): Promise<string> {
    try {
      if (!Array.isArray(args.metrics) || args.metrics.length === 0) {
        return JSON.stringify({ error: 'metrics must be a non-empty array' });
      }

      const metrics = args.metrics as string[];
      const aggregation = VALID_AGGREGATIONS.includes(
        args.aggregation as AggregationPeriod,
      )
        ? (args.aggregation as AggregationPeriod)
        : 'daily';

      const startDate = new Date(args.startDate as string);
      if (Number.isNaN(startDate.getTime())) {
        return JSON.stringify({ error: 'Invalid startDate format' });
      }

      const endDate = args.endDate
        ? new Date(args.endDate as string)
        : new Date();
      if (Number.isNaN(endDate.getTime())) {
        return JSON.stringify({ error: 'Invalid endDate format' });
      }

      if (startDate >= endDate) {
        return JSON.stringify({ error: 'startDate must be before endDate' });
      }

      const result = await this.timeSeriesAIService.queryHistoricalData({
        siteId,
        metrics,
        startDate,
        endDate,
        aggregation,
        maxRawRows: 500,
      });

      return JSON.stringify({
        summary: result.summary,
        aggregation: result.aggregation,
        startDate: result.startDate,
        endDate: result.endDate,
        dataPoints: result.data.length,
        data: result.data,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      this.logger.error(`Tool execution error (query_time_series): ${msg}`);
      return JSON.stringify({ error: msg });
    }
  }
}
