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
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import {
  ApiHideProperty,
  ApiProperty,
  ApiPropertyOptional,
} from '@nestjs/swagger';
import { Region } from '../regions/regions.entity';
import { VideoStream } from './video-streams.entity';
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

  @ManyToOne(() => VideoStream, { onDelete: 'SET NULL', nullable: true })
  @Index()
  stream: VideoStream | null;

  @ManyToMany(() => User, (user) => user.administeredSites, {
    onDelete: 'CASCADE',
  })
  admins: User[];

  @ApiPropertyOptional()
  @OneToMany(() => Survey, (survey) => survey.site)
  surveys: Survey[];

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

  hasHobo: boolean;

  collectionData?: CollectionDataDto;

  @Expose()
  get applied(): boolean {
    return !!this.siteApplication?.permitRequirements;
  }
}
