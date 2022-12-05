import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  RelationId,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Site } from '../sites/sites.entity';
import { User } from '../users/users.entity';
import { DailyData } from '../sites/daily-data.entity';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Observations, SurveyMedia } from './survey-media.entity';
import { SensorDataDto } from '../sensors/dto/sensor-data.dto';
import { sensorDataSchema } from '../docs/api-sensor-data';

export enum WeatherConditions {
  Calm = 'calm',
  Wavy = 'waves',
  Stormy = 'storm',
  NoData = 'no-data',
}

@Entity()
export class Survey {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'weather_conditions',
    type: 'enum',
    enum: WeatherConditions,
    default: 'no-data',
    nullable: false,
  })
  weatherConditions: WeatherConditions;

  @ApiProperty({ example: 33.2 })
  @Column('float', { nullable: true })
  temperature?: number | null;

  @ApiProperty({ example: 'Survey comment' })
  @Column('text', { nullable: true })
  comments?: string | null;

  @Column({ nullable: false })
  diveDate: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @RelationId((survey: Survey) => survey.site)
  siteId: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'site_id' })
  @Index()
  site: Site;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => SurveyMedia, (surveyMedia) => surveyMedia.surveyId)
  featuredSurveyMedia?: SurveyMedia;

  @OneToMany(() => SurveyMedia, (surveyMedia) => surveyMedia.surveyId)
  surveyMedia?: SurveyMedia[];

  latestDailyData?: DailyData;

  surveyPoints?: SiteSurveyPoint[];

  observations?: Observations[];

  satelliteTemperature?: number;

  @ApiProperty(sensorDataSchema)
  sensorData?: SensorDataDto;
}
