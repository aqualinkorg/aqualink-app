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
import { Metric } from './metrics.entity';

@Entity()
@Unique('no_duplicate_data', ['metric', 'source', 'timestamp'])
@Index(['metric', 'source', 'timestamp'])
export class TimeSeries {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  timestamp: Date;

  @ApiProperty({ example: 11.05 })
  @Column({ type: 'float', nullable: false })
  value: number;

  @Column({ type: 'enum', enum: Metric, nullable: false })
  metric: Metric;

  @ManyToOne(() => Sources, { onDelete: 'SET NULL', nullable: true })
  source: Sources | null;

  @ManyToOne(() => DataUploads, { onDelete: 'CASCADE', nullable: true })
  dataUpload: DataUploads | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
