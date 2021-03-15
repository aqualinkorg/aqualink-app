import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from '../reefs/reefs.entity';
import { Sources } from '../reefs/sources.entity';
import { Metric } from './metrics.entity';

@Entity()
@Unique('no_duplicate_data', ['timestamp', 'reef', 'poi', 'metric', 'source'])
export class TimeSeries {
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

  @ManyToOne(() => Sources, { onDelete: 'SET NULL', nullable: true })
  source: Sources;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
