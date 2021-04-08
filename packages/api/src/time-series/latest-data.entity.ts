import {
  Column,
  Connection,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  ViewEntity,
} from 'typeorm';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from '../reefs/reefs.entity';
import { SourceType } from '../reefs/sources.entity';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select(
        'DISTINCT ON (metric, source_id, time_series.reef_id, time_series.poi_id) metric',
        'metric',
      )
      .addSelect('time_series.id', 'id')
      .addSelect('timestamp')
      .addSelect('value')
      .addSelect('time_series.reef_id', 'reef_id')
      .addSelect('time_series.poi_id', 'poi_id')
      .addSelect('source.type', 'source')
      .from(TimeSeries, 'time_series')
      .innerJoin('sources', 'source', 'source.id = source_id')
      .orderBy('reef_id, poi_id, metric, source_id, timestamp', 'DESC'),
})
export class LatestData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  timestamp: Date;

  @Column({ type: 'float', nullable: false })
  value: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE', nullable: false })
  reef: Reef;

  @RelationId((latestData: LatestData) => latestData.reef)
  reefId: number;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE', nullable: true })
  poi: ReefPointOfInterest;

  @Column({ type: 'enum', enum: SourceType })
  source: SourceType;

  @Column({ type: 'enum', enum: Metric })
  metric: Metric;
}
