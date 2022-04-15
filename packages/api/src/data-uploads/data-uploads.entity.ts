import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Site } from '../sites/sites.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from '../time-series/metrics.entity';

@Entity()
export class DataUploads {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  site: Site;

  @ManyToOne(() => SiteSurveyPoint, { onDelete: 'CASCADE', nullable: false })
  surveyPoint: SiteSurveyPoint;

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
