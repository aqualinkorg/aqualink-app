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
import { SourceType } from '../sites/schemas/source-type.enum';
import { Site } from '../sites/sites.entity';
import { WindWaveMetric } from './wind-wave-data.types';

@Entity()
@Unique('one_row_per_site_per_metric_per_source', ['site', 'metric', 'source'])
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

  @Column({ type: 'enum', enum: SourceType })
  source: SourceType;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
