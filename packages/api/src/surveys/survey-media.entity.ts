import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Survey } from './surveys.entity';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';

export enum Observations {
  Healthy = 'healthy',
  PossibleDisease = 'possible-disease',
  EvidentDisease = 'evident-disease',
  Mortality = 'mortality',
  Environmental = 'environmental',
  Anthropogenic = 'anthropogenic',
  NoData = 'no-data',
}

export enum MediaType {
  Video = 'video',
  Image = 'image',
}

@Entity()
export class SurveyMedia {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    example:
      'https://storage.googleapis.com/storage/reef-image-a5b5f5c5d5da5d5e.jpg',
  })
  @Column()
  url: string;

  @ApiProperty({ example: 1 })
  @Column({ default: 1 })
  quality: number;

  @Column()
  featured: boolean;

  @Column()
  hidden: boolean;

  @ApiProperty({ example: {} })
  @Column('json')
  metadata: string;

  @Column({
    type: 'enum',
    enum: Observations,
  })
  observations: Observations;

  @ApiProperty({ example: 'Survey media comments' })
  @Column({ nullable: true })
  comments: string;

  @ManyToOne(() => Survey, { onDelete: 'CASCADE', eager: true })
  @JoinColumn({ name: 'survey_id' })
  surveyId: Survey;

  @Column({
    type: 'enum',
    enum: MediaType,
  })
  type: MediaType;

  @ManyToOne(() => ReefPointOfInterest, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'poi_id' })
  poi?: ReefPointOfInterest;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
