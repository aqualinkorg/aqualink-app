import {
  Column,
  Connection,
  ManyToOne,
  PrimaryGeneratedColumn,
  ViewEntity,
} from 'typeorm';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from '../reefs/reefs.entity';
import { Metrics } from './metrics.entity';
import { TimeSeries } from './time-series.entity';

@ViewEntity({
  materialized: true,
  expression: (connection: Connection) =>
    connection
      .createQueryBuilder()
      .select('DISTINCT ON (metric_id) metric_id')
      .addSelect('id')
      .addSelect('timestamp')
      .addSelect('value')
      .addSelect('reef_id')
      .addSelect('poi_id')
      .from(TimeSeries, 'time_series')
      .orderBy('metric_id, timestamp', 'DESC'),
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

  @ManyToOne(() => Metrics, { onDelete: 'SET NULL', nullable: true })
  metric: Metrics;
}
