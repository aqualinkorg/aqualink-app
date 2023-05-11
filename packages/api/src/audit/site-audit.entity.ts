import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Site } from '../sites/sites.entity';

enum SiteColumn {
  NAME = 'name',
  SENSOR_ID = 'sensor_id',
  STATUS = 'status',
  VIDEO_STREAM = 'video_stream',
  MAX_MONTHLY_MEAN = 'max_monthly_mean',
  DISPLAY = 'display',
  SOFAR_API_TOKEN = 'spotter_api_token',
}

@Entity()
export class SiteAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ nullable: true })
  oldValue: string;

  @Index()
  @Column({ nullable: true })
  newValue: string;

  @Column({ type: 'enum', enum: SiteColumn })
  columnName: SiteColumn;

  @ManyToOne(() => Site, { nullable: false, onDelete: 'CASCADE' })
  @Index()
  site: Site;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
