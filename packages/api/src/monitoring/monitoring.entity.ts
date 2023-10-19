import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import { Site } from '../sites/sites.entity';
import { User } from '../users/users.entity';
import { MonitoringMetric } from './schemas/monitoring-metric.enum';

@Entity()
export class Monitoring {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: MonitoringMetric, nullable: false })
  metric: MonitoringMetric;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  @Index()
  user: User;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'site_id' })
  @Index()
  site: Site;

  @CreateDateColumn({ name: 'timestamp' })
  @Index()
  createdAt: Date;
}
