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
import { Expose } from 'class-transformer';
import { Region } from '../regions/regions.entity';
import { DailyData } from './daily-data.entity';
import { VideoStream } from './video-streams.entity';
import { Survey } from '../surveys/surveys.entity';
import { User } from '../users/users.entity';
import { ReefApplication } from '../reef-applications/reef-applications.entity';
import { HistoricalMonthlyMean } from './historical-monthly-mean.entity';

export enum ReefStatus {
  InReview = 'in_review',
  Rejected = 'rejected',
  Approved = 'approved',
  Shipped = 'shipped',
  Deployed = 'deployed',
  Maintenance = 'maintenance',
}

@Entity()
export class Reef {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  spotterId: string;

  @Column({
    type: 'geometry',
    unique: true,
    srid: 4326,
  })
  @Index({ spatial: true })
  polygon: GeoJSON;

  @Column({ nullable: true })
  depth: number;

  // TODO:  This field should be transferred to reef-application table
  //        The transition has to be in sync with changes in admin dashboards in internal.io
  @Column({
    type: 'enum',
    enum: ReefStatus,
    default: ReefStatus.InReview,
  })
  status: ReefStatus;

  @Column({ nullable: true })
  videoStream: string;

  @Column('float', { nullable: true })
  maxMonthlyMean: number;

  @Column({ nullable: true })
  timezone: string;

  @Column({ default: true })
  approved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Region, { onDelete: 'SET NULL', nullable: true })
  region?: Region;

  @ManyToOne(() => VideoStream, { onDelete: 'SET NULL', nullable: true })
  stream?: VideoStream;

  @ManyToMany(() => User, (user) => user.administeredReefs)
  admins: User[];

  @OneToOne(() => DailyData, (latestDailyData) => latestDailyData.reef)
  latestDailyData?: DailyData;

  @OneToMany(() => Survey, (survey) => survey.reef)
  surveys: Survey[];

  @OneToOne(() => ReefApplication, (reefApplication) => reefApplication.reef)
  reefApplication?: ReefApplication;

  @OneToMany(
    () => HistoricalMonthlyMean,
    (historicalMonthlyMean) => historicalMonthlyMean.reef,
  )
  historicalMonthlyMean: HistoricalMonthlyMean[];

  hasHobo: boolean;

  @Expose()
  get applied(): boolean {
    return !!this.reefApplication?.permitRequirements;
  }
}
