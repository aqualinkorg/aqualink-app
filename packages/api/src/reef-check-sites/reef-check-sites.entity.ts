import {
  Entity,
  Column,
  Index,
  JoinColumn,
  PrimaryColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ReefCheckSurvey } from '../reef-check-surveys/reef-check-surveys.entity';
import { Site } from '../sites/sites.entity';

@Entity()
export class ReefCheckSite {
  @ApiProperty()
  @PrimaryColumn()
  id: string;

  @ApiProperty()
  @Column()
  siteId: number;

  @ApiProperty()
  @OneToOne(() => Site, { nullable: false })
  @JoinColumn({ name: 'site_id' })
  @Index()
  site: Site;

  @ApiProperty()
  @Column({ nullable: true })
  reefName: string;

  @ApiProperty()
  @Column({ nullable: true })
  orientation: string;

  @ApiProperty()
  @Column({ nullable: true })
  country: string;

  @ApiProperty()
  @Column({ nullable: true })
  stateProvinceIsland: string;

  @ApiProperty()
  @Column({ nullable: true })
  cityTown: string;

  @ApiProperty()
  @Column({ nullable: true })
  region: string;

  @ApiProperty()
  @Column('float', { nullable: true })
  distanceFromShore: number;

  @ApiProperty()
  @Column('float', { nullable: true })
  distanceFromNearestRiver: number;

  @ApiProperty()
  @Column('float', { nullable: true })
  distanceToNearestPopn: number;

  @ApiPropertyOptional()
  @OneToMany(() => ReefCheckSurvey, (survey) => survey.site)
  surveys: ReefCheckSurvey[];
}
