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

  @Column({ type: 'enum', enum: Metric, nullable: false })
  metric: Metric;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
