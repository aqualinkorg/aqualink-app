import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Reef } from '../reefs/reefs.entity';
// eslint-disable-next-line import/no-cycle
import { User } from '../users/users.entity';
// eslint-disable-next-line import/no-cycle
import { DailyData } from '../reefs/daily-data.entity';
// eslint-disable-next-line import/no-cycle
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
// eslint-disable-next-line import/no-cycle
import { SurveyMedia } from './survey-media.entity';

export enum WeatherConditions {
  Calm = 'calm',
  Wavy = 'waves',
  Stormy = 'storm',
}

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    name: 'weather_conditions',
    type: 'enum',
    enum: WeatherConditions,
  })
  weatherConditions: WeatherConditions;

  @Column('float', { nullable: true })
  temperature?: number;

  @Column('text', { nullable: true })
  comments?: string;

  @Column()
  diveDate: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  userId?: User;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reef?: Reef;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @OneToOne(() => SurveyMedia, (surveyMedia) => surveyMedia.surveyId)
  featuredSurveyMedia?: SurveyMedia;

  latestDailyData?: DailyData;

  surveyPoints?: ReefPointOfInterest[];
}
