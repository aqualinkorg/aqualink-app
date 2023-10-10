import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { SiteSurveyPoint } from '../site-survey-points/site-survey-points.entity';
import { Site } from './sites.entity';
import { SourceType } from './schemas/source-type.enum';

@Entity()
// Typeorm does not allow to add raw SQL on column declaration
// So we will edit the query on the migration
// CREATE UNIQUE INDEX "no_duplicate_sources" ON "sources" ("site_id", COALESCE("survey_point_id", 0), "type", COALESCE("sensor_id", 'SPOT-IMPOSSIBLE'))
@Index('no_duplicate_sources', { synchronize: false })
export class Sources {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  site: Site;

  @ManyToOne(() => SiteSurveyPoint, { onDelete: 'CASCADE', nullable: true })
  surveyPoint: SiteSurveyPoint | null;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @ApiProperty({ example: 12 })
  @Column('float', { nullable: true })
  depth: number | null;

  @ApiProperty({ example: 'SPOT-0000' })
  @Column({ nullable: true, type: 'character varying' })
  sensorId: string | null;
}
