import {
  Column,
  Connection,
  ManyToOne,
  PrimaryGeneratedColumn,
  ViewEntity,
} from 'typeorm';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from '../reefs/reefs.entity';
import { Metric } from './metrics.entity';
import { TimeSeries } from './time-series.entity';

@ViewEntity({
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select(
        'DISTINCT ON (metric_id, reef_id, poi_id) metric.metric',
        'metric',
      )
      .addSelect('time_series.id', 'id')
      .addSelect('timestamp')
      .addSelect('value')
      .addSelect('reef_id')
      .addSelect('poi_id')
      .from(TimeSeries, 'time_series')
      .innerJoin('metrics', 'metric', 'metric.id = metric_id')
      .orderBy('reef_id, poi_id, metric_id, timestamp', 'DESC'),
})
export class LatestData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  timestamp: Date;

  @Column({ type: 'float' })
  value: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE' })
  poi: ReefPointOfInterest;

  @Column({ type: 'enum', enum: Metric })
  metric: Metric;
}
