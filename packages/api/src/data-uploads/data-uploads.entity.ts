import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from '../time-series/metrics.enum';

@Entity()
@Unique(['file', 'signature'])
export class DataUploads {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column('character varying', { array: true, nullable: true })
  sensorTypes: SourceType[];

  @Column({ nullable: false })
  file: string;

  @Column({ nullable: false })
  signature: string;

  @Column({ nullable: false })
  minDate: Date;

  @Column({ nullable: false })
  maxDate: Date;

  @Column('character varying', { array: true, nullable: false })
  metrics: Metric[];

  @Column({ nullable: true })
  fileLocation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
