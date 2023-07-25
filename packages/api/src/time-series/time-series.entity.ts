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
import { DataUploads } from '../data-uploads/data-uploads.entity';
import { Sources } from '../sites/sources.entity';
import { Metric } from './metrics.enum';

@Entity()
@Unique('no_duplicate_data', ['metric', 'source', 'timestamp'])
// https://github.com/typeorm/typeorm/issues/3336
// CREATE INDEX "IDX_cb2f3e83c09f83e8ce007ffd6f" ON "time_series" ("metric", "source_id", "timestamp" DESC)
@Index('IDX_time_series_metric_source_timestamp_DESC', { synchronize: false })
export class TimeSeries {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: false })
  timestamp: Date;

  @ApiProperty({ example: 11.05 })
  @Column({ type: 'float', nullable: false })
  value: number;

  @Column({ type: 'enum', enum: Metric, nullable: false })
  metric: Metric;

  @ManyToOne(() => Sources, { onDelete: 'CASCADE', nullable: false })
  source: Sources | null;

  @ManyToOne(() => DataUploads, { onDelete: 'CASCADE', nullable: true })
  dataUpload: DataUploads | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
