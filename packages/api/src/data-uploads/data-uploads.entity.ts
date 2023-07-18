import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Site } from '../sites/sites.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from '../time-series/metrics.enum';

@Entity()
@Unique(['file', 'signature'])
export class DataUploads {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToMany(() => Site, (site) => site.dataUploads, { onDelete: 'CASCADE' })
  @JoinTable()
  sites: Site;

  @Column({ type: 'enum', enum: SourceType })
  sensorType: SourceType;

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
