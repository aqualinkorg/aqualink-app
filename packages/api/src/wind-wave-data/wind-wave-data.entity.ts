import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from '../sites/sites.entity';
import { Metric } from '../time-series/metrics.entity';

export enum WindWaveMetric {
  SIGNIFICANT_WAVE_HEIGHT = Metric.SIGNIFICANT_WAVE_HEIGHT,
  WAVE_MEAN_DIRECTION = Metric.WAVE_MEAN_DIRECTION,
  WAVE_MEAN_PERIOD = Metric.WAVE_MEAN_PERIOD,
  WIND_SPEED = Metric.WIND_SPEED,
  WIND_DIRECTION = Metric.WIND_DIRECTION,
}

@Entity()
@Unique('one_row_per_site_per_metric', ['site', 'metric'])
@Index(['site'])
export class ForecastData {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  site: Site;

  @Column({ nullable: false })
  timestamp: Date;

  @Column({ type: 'float', nullable: false })
  value: number;

  @Column({ type: 'enum', enum: WindWaveMetric, nullable: false })
  metric: WindWaveMetric;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
