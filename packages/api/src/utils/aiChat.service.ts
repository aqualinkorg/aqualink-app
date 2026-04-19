import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { buildSiteContext } from './aiSiteContextBuilder';
import { callGrokAPI, ToolExecutor } from './aiGrokService';
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
  ) {}

  async chat(request: AIChatRequest): Promise<string> {
    const { siteId, message, conversationHistory, isFirstMessage } = request;

    const siteContext = await buildSiteContext(siteId, this.dataSource);

    const toolExecutor: ToolExecutor = async (toolName, args) => {
      if (toolName === 'query_time_series') {
        return this.executeQueryTimeSeries(siteId, args);
      }
      return JSON.stringify({ error: `Unknown tool: ${toolName}` });
    };

    return callGrokAPI(
      message,
      siteContext,
      conversationHistory,
      isFirstMessage,
      toolExecutor,
    );
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
