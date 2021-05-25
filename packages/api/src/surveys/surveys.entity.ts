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
} from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { User } from '../users/users.entity';
import { DailyData } from '../reefs/daily-data.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Observations, SurveyMedia } from './survey-media.entity';
import { SourceType } from '../reefs/sources.entity';
import { Metric } from '../time-series/metrics.entity';
import { TimeSeriesPoint } from '../time-series/time-series.entity';

export enum WeatherConditions {
  Calm = 'calm',
  Wavy = 'waves',
  Stormy = 'storm',
  NoData = 'no-data',
}

export interface SensorData {
  [SourceType.SPOTTER]?: {
    [Metric.BOTTOM_TEMPERATURE]?: TimeSeriesPoint;
    [Metric.TOP_TEMPERATURE]?: TimeSeriesPoint;
  };
  [SourceType.HOBO]?: {
    [Metric.BOTTOM_TEMPERATURE]?: TimeSeriesPoint;
  };
  [SourceType.NOAA]?: {
    [Metric.SATELLITE_TEMPERATURE]?: TimeSeriesPoint;
  };
}

@Entity()
export class Survey {
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

  @Column('float', { nullable: true })
  temperature?: number;

  @Column('text', { nullable: true })
  comments?: string;

  @Column({ nullable: false })
  diveDate: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @RelationId((survey: Survey) => survey.reef)
  reefId: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'reef_id' })
  reef: Reef;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToOne(() => SurveyMedia, (surveyMedia) => surveyMedia.surveyId)
  featuredSurveyMedia?: SurveyMedia;

  @OneToMany(() => SurveyMedia, (surveyMedia) => surveyMedia.surveyId)
  surveyMedia?: SurveyMedia[];

  latestDailyData?: DailyData;

  surveyPoints?: ReefPointOfInterest[];

  observations?: Observations[];

  sensorData?: SensorData;
}
