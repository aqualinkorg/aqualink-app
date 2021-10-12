import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Connection,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  ViewEntity,
} from 'typeorm';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';

@ViewEntity({
  expression: (connection: Connection) => {
    const subQuery = connection
      .createQueryBuilder()
      .select('DISTINCT ON (metric, source_id) metric', 'metric')
      .addSelect('id')
      .addSelect('timestamp')
      .addSelect('value')
      .addSelect('source_id')
      .from(TimeSeries, 'time_series')
      .orderBy('metric, source_id, timestamp', 'DESC');

    return connection
      .createQueryBuilder()
      .from(() => subQuery, 'time_series')
      .addSelect('site_id')
      .addSelect('survey_point_id')
      .innerJoin('sources', 'source', 'source.id = time_series.source_id');
  },
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
