import { GeoJSON } from 'geojson';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  ManyToMany,
  Check,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { ReefCheckSite } from '../reef-check-sites/reef-check-sites.entity';
import { ReefCheckSurvey } from '../reef-check-surveys/reef-check-surveys.entity';
import { SketchFab } from '../site-sketchfab/site-sketchfab.entity';
import { Region } from '../regions/regions.entity';
import { Survey } from '../surveys/surveys.entity';
import { User } from '../users/users.entity';
import { SiteApplication } from '../site-applications/site-applications.entity';
import { HistoricalMonthlyMean } from './historical-monthly-mean.entity';
import { ApiPointProperty } from '../docs/api-properties';
import { CollectionDataDto } from '../collections/dto/collection-data.dto';

export enum SiteStatus {
  InReview = 'in_review',
  Rejected = 'rejected',
  Approved = 'approved',
  Shipped = 'shipped',
  Deployed = 'deployed',
  Maintenance = 'maintenance',
  Lost = 'lost',
  EndOfLife = 'end_of_life',
}

export enum SensorType {
  SofarSpotter = 'sofar_spotter',
}

@Entity()
export class Site {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Duxbury Site' })
  @Column({ nullable: true, type: 'character varying' })
  name: string | null;

  @ApiProperty({ example: 'SPOT-0000' })
  @Column({ nullable: true, type: 'character varying' })
  sensorId: string | null;

  @ApiPointProperty()
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    unique: true,
    srid: 4326,
    nullable: false,
  })
  @Index({ spatial: true })
  polygon: GeoJSON | null;

  @ApiPointProperty()
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  nearestNOAALocation: GeoJSON | null;

  @ApiProperty({ example: 23 })
  @Column({ nullable: true, type: 'integer' })
  depth: number | null;

  @ApiProperty({ example: 'https://something.example.com' })
  @Column({ nullable: true, type: 'character varying' })
  @Check('char_length(iframe) <= 200 AND char_length(iframe) > 10')
  iframe: string | null;

  // TODO:  This field should be transferred to site-application table
  //        The transition has to be in sync with changes in admin dashboards in internal.io
  @Column({
    type: 'enum',
    enum: SiteStatus,
    default: SiteStatus.InReview,
    nullable: false,
  })
  status: SiteStatus;

  @Column({ nullable: true, type: 'character varying' })
  videoStream: string | null;

  @ApiProperty({ example: 33.54 })
  @Column('float', { nullable: true })
  maxMonthlyMean: number | null;

  @ApiProperty({ example: 'Pacific/Palau' })
  @Column({ nullable: true, type: 'character varying' })
  timezone: string | null;

  @Column({ default: true })
  display: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Region, { onDelete: 'SET NULL', nullable: true })
  @Index()
  region: Region | null;

  @OneToOne(() => SketchFab, (sketchFab) => sketchFab.site)
  sketchFab?: SketchFab | null;

  @ManyToMany(() => User, (user) => user.administeredSites, {
    onDelete: 'CASCADE',
  })
  admins: User[];

  @ApiPropertyOptional({ type: () => [ReefCheckSite] })
  @OneToMany(() => ReefCheckSite, (reefCheckSite) => reefCheckSite.site)
  reefCheckSites: ReefCheckSite[];

  @ApiPropertyOptional()
  @OneToMany(() => Survey, (survey) => survey.site)
  surveys: Survey[];

  @ApiPropertyOptional()
  @OneToMany(() => ReefCheckSurvey, (reefCheckSurvey) => reefCheckSurvey.site)
  reefCheckSurveys: ReefCheckSurvey[];

  @OneToOne(() => SiteApplication, (siteApplication) => siteApplication.site)
  siteApplication?: SiteApplication;

  @ApiPropertyOptional()
  @OneToMany(
    () => HistoricalMonthlyMean,
    (historicalMonthlyMean) => historicalMonthlyMean.site,
  )
  historicalMonthlyMean: HistoricalMonthlyMean[];

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true, select: false, type: 'character varying' })
  spotterApiToken?: string | null;

  @ApiHideProperty()
  @Exclude()
  @Column({ nullable: true, select: false, type: 'character varying' })
  contactInformation?: string | null;

  @ApiProperty({ example: '0x3fe044d4a9e8f229' })
  @Expose()
  @Column({
    name: 'bristlemouth_node_id',
    nullable: true,
    type: 'character varying',
    length: 50,
  })
  bristlemouthNodeId?: string | null;

  @ApiProperty({ example: false })
  @Expose()
  @Column({
    name: 'has_seaphox',
    default: false,
    nullable: true,
    type: 'boolean',
  })
  hasSeaphox?: boolean;

  hasHobo?: boolean;

  collectionData?: CollectionDataDto;

  maskedSpotterApiToken?: string;

  waterQualitySources?: string[];

  @Expose()
  get applied(): boolean {
    return !!this.siteApplication?.permitRequirements;
  }
}
