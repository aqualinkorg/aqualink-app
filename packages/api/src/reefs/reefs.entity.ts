import { GeoJSON } from 'geojson';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Region } from '../regions/regions.entity';
import { User } from '../users/users.entity';
// eslint-disable-next-line import/no-cycle
import { DailyData } from './daily-data.entity';
import { VideoStream } from './video-streams.entity';

@Entity()
export class Reef {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name: string;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Region, { onDelete: 'CASCADE', nullable: true })
  region?: Region;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  admin?: User;

  @ManyToOne(() => VideoStream, { onDelete: 'CASCADE', nullable: true })
  stream?: VideoStream;

  @OneToMany(() => DailyData, (dailyData) => dailyData.reef)
  dailyData?: DailyData[];
}
