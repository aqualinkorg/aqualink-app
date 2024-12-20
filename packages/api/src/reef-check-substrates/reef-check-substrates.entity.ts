import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReefCheckSurvey } from '../reef-check-surveys/reef-check-surveys.entity';

@Entity()
export class ReefCheckSubstrate {
  @ApiProperty()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty()
  @Column()
  surveyId: string;

  @ApiProperty()
  @ManyToOne(() => ReefCheckSurvey, { nullable: false })
  @JoinColumn()
  survey: ReefCheckSurvey;

  @ApiProperty()
  @Column()
  date: Date;

  @ApiProperty()
  @Column()
  substrateCode: string;

  @ApiProperty()
  @Column()
  s1: number;

  @ApiProperty()
  @Column()
  s2: number;

  @ApiProperty()
  @Column()
  s3: number;

  @ApiProperty()
  @Column()
  s4: number;

  @ApiProperty()
  @Column({ nullable: true })
  recordedBy: string;

  @ApiProperty()
  @Column({ nullable: true })
  errors: string;
}
