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

  @Column({ nullable: true })
  name: string;

  @Column('geometry')
  @Index({ spatial: true })
  polygon: string;

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
  @JoinColumn({ name: 'region_id' })
  regionId: Region | number;

  @ManyToOne(() => User, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'admin_id' })
  adminId: User | number;

  @ManyToOne(() => VideoStream, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'stream_id' })
  streamId: VideoStream | number;
}
