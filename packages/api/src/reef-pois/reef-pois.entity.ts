import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Reef } from '../reefs/reefs.entity';
// eslint-disable-next-line import/no-cycle
import { SurveyMedia } from '../surveys/survey-media.entity';

@Entity()
export class ReefPointOfInterest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  poiLabelId: number;

  @Column({ nullable: true })
  imageUrl: string;

  @Column()
  name: string;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => SurveyMedia, (surveyMedia) => surveyMedia.poiId)
  surveyMedia: SurveyMedia[];
}
