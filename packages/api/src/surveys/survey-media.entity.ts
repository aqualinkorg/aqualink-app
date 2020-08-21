import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Survey } from './surveys.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';

export enum Observations {
  Healthy = 'healthy',
  PossibleDisease = 'possible-disease',
  EvidentDisease = 'evident-disease',
  Mortality = 'mortality',
  Environmental = 'environmental',
  Anthropogenic = 'anthropogenic',
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
  observations: string;

  @Column()
  comments: string;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'survey_id' })
  surveyId: Survey;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'poi_id' })
  poiId: ReefPointOfInterest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
