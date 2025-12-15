import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  DataSource,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  ViewEntity,
} from 'typeorm';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { TimeSeries } from './time-series.entity';
import { Metric } from './metrics.enum';

@ViewEntity({
  expression: (dataSource: DataSource) =>
    dataSource
      .createQueryBuilder()
      .select(
        'DISTINCT ON (metric, type, site_id, survey_point_id) time_series.id',
      )
      .addSelect('metric')
      .addSelect('timestamp')
      .addSelect('value')
      .addSelect('type', 'source')
      .addSelect('site_id')
      .addSelect('survey_point_id')
      .from(TimeSeries, 'time_series')
      .innerJoin('sources', 'sources', 'sources.id = time_series.source_id')
      // Limit data to the past week. Bonus, it makes view refreshes a lot faster.
      .where("timestamp >= current_date - INTERVAL '7 days'")
      // Look a bit further in the past for sonde data
      .orWhere(
        "type IN ('sonde') AND (timestamp >= current_date - INTERVAL '2 years')",
      )
      .orWhere(
        "type IN ('hui') AND (timestamp >= current_date - INTERVAL '2 years')",
      )
      .orWhere(
        "type IN ('sheet_data') AND (timestamp >= current_date - INTERVAL '2 years')",
      )
      .orderBy('metric, type, site_id, survey_point_id, timestamp', 'DESC'),
  materialized: true,
})
export class LatestData {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  timestamp: Date;

  @ApiProperty({ example: 11.05 })
  @Column({ type: 'float', nullable: false })
  value: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  site: Site;

  @ApiProperty({ example: 15 })
  @RelationId((latestData: LatestData) => latestData.site)
  siteId: number;

  @ManyToOne(() => SiteSurveyPoint, { onDelete: 'CASCADE', nullable: true })
  surveyPoint: SiteSurveyPoint | null;

  @Column({ type: 'enum', enum: SourceType })
  source: SourceType;

  @Column({ type: 'enum', enum: Metric })
  metric: Metric;
}
