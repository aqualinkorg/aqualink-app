import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  RelationId,
} from 'typeorm';
import { GeoJSON } from 'geojson';
import { ApiProperty } from '@nestjs/swagger';
import { Site } from '../sites/sites.entity';
import { ApiPointProperty } from '../docs/api-properties';

@Entity()
export class SiteSurveyPoint {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1 })
  @Column({ nullable: true, type: 'integer' })
  surveyPointLabelId: number | null;

  @ApiProperty({ example: 'http://some-sample-url.com' })
  @Column({ nullable: true, type: 'character varying' })
  imageUrl: string | null;

  @ApiProperty({ example: 'Outer tide pool' })
  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  @Index()
  site: Site;

  @ApiProperty({ example: 1 })
  @RelationId((surveyPoint: SiteSurveyPoint) => surveyPoint.site)
  siteId: number;

  @ApiPointProperty()
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    unique: true,
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  polygon: GeoJSON | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
