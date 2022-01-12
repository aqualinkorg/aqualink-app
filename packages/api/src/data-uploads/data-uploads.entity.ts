import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Site } from '../sites/sites.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { SourceType } from '../sites/schemas/source-type.enum';

@Entity()
export class DataUploads {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Site, { onDelete: 'CASCADE' })
  @JoinColumn()
  site: Site;

  @OneToOne(() => SiteSurveyPoint, { onDelete: 'CASCADE' })
  @JoinColumn()
  surveyPoint: SiteSurveyPoint;

  @Column({ type: 'enum', enum: SourceType })
  sensorType: SourceType;

  @Column({ nullable: false })
  minDate: Date;

  @Column({ nullable: false })
  maxDate: Date;
}
