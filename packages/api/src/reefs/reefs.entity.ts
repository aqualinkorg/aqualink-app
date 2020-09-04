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
  JoinTable,
} from 'typeorm';
import { Region } from '../regions/regions.entity';
// eslint-disable-next-line import/no-cycle
import { DailyData } from './daily-data.entity';
import { VideoStream } from './video-streams.entity';
// eslint-disable-next-line import/no-cycle
import { Survey } from '../surveys/surveys.entity';
// eslint-disable-next-line import/no-cycle
import { User } from '../users/users.entity';

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

  @Column('float', { nullable: true })
  temperatureThreshold: number;

  @Column({ nullable: true })
  depth: number;

  @Column({ default: 0 })
  status: number;

  @Column({ nullable: true })
  videoStream: string;

  @Column('float', { nullable: true })
  maxMonthlyMean: number;

  @Column({ nullable: true })
  timezone: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Region, { nullable: true })
  region?: Region;

  @ManyToOne(() => VideoStream, { onDelete: 'CASCADE', nullable: true })
  stream?: VideoStream;

  @ManyToMany(() => User, (user) => user.administeredReefs, { cascade: true })
  @JoinTable()
  admins: User[];

  @OneToOne(() => DailyData, (latestDailyData) => latestDailyData.reef)
  latestDailyData?: DailyData;

  @OneToMany(() => Survey, (survey) => survey.reef)
  surveys: Survey[];
}
