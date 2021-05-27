import { ApiProperty } from '@nestjs/swagger';
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

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

@Entity()
@Unique('no_duplicate_data', ['timestamp', 'reef', 'poi', 'metric', 'source'])
@Unique('no_duplicate_reef_data', ['timestamp', 'reef', 'metric', 'source'])
export class TimeSeries {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  timestamp: Date;

  @ApiProperty({ example: 11.05 })
  @Column({ type: 'float', nullable: false })
  value: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE', nullable: false })
  reef: Reef;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE', nullable: true })
  poi?: ReefPointOfInterest;

  @Column({ type: 'enum', enum: Metric, nullable: false })
  metric: Metric;

  @ManyToOne(() => Sources, { onDelete: 'SET NULL', nullable: true })
  source?: Sources;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
