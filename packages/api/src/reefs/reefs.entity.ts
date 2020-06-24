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

  @Column('geometry')
  @Index({ spatial: true })
  polygon: string;

  @Column('float')
  temperatureThreshold: number;

  @Column()
  depth: number;

  @Column()
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
