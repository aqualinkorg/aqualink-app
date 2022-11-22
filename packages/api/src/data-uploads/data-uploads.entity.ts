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
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Site } from '../sites/sites.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { SourceType } from '../sites/schemas/source-type.enum';
import { Metric } from '../time-series/metrics.entity';

@Entity()
@Unique(['file', 'signature'])
export class DataUploads {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @Index()
  site: Site;

  @ManyToOne(() => SiteSurveyPoint, { onDelete: 'CASCADE' })
  @Index()
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
