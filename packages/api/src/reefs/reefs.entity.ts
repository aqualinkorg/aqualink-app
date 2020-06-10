import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Region } from '../regions/regions.entity';
import { User } from '../users/users.entity';
import { VideoStream } from './video-streams.entity';

@Entity()
export class Reef {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column('polygon')
  @Index({ spatial: true })
  polygon: string;

  @Column('float')
  temperatureThreshold: number;

  @Column()
  depth: number;

  @Column()
  status: string;

  @Column({ nullable: true })
  videoStream: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Region, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'region_id' })
  regionId: Region;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'admin_id' })
  adminId: User;

  @ManyToOne(() => VideoStream, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'stream_id' })
  streamId: VideoStream;
}
