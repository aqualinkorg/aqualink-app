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
}

@Entity()
export class SiteAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  oldValue: string;

  @Index()
  @Column()
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
