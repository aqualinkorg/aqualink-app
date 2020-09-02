import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Survey } from './surveys.entity';
// eslint-disable-next-line import/no-cycle
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';

export enum Observations {
  Healthy = 'healthy',
  PossibleDisease = 'possible-disease',
  EvidentDisease = 'evident-disease',
  Mortality = 'mortality',
  Environmental = 'environmental',
  Anthropogenic = 'anthropogenic',
}

export enum MediaType {
  Video = 'video',
  Image = 'image',
}

@Entity()
export class SurveyMedia {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  url: string;

  @Column({ default: 1 })
  quality: number;

  @Column()
  featured: boolean;

  @Column()
  hidden: boolean;

  @Column('json')
  metadata: string;

  @Column({
    type: 'enum',
    enum: Observations,
  })
  observations: Observations;

  @Column()
  comments: string;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'survey_id' })
  surveyId: Survey;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poi_id' })
  poiId: ReefPointOfInterest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
