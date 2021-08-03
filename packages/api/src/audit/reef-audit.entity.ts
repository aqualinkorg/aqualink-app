import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Reef } from '../reefs/reefs.entity';

enum ReefColumn {
  NAME = 'name',
  SENSOR_ID = 'sensor_id',
  STATUS = 'status',
  VIDEO_STREAM = 'video_stream',
  MAX_MONTHLY_MEAN = 'max_monthly_mean',
  APPROVED = 'approved',
}

@Entity()
export class ReefAudit {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column()
  oldValue: string;

  @Index()
  @Column()
  newValue: string;

  @Column({ type: 'enum', enum: ReefColumn })
  columnName: ReefColumn;

  @ManyToOne(() => Reef, { nullable: false, onDelete: 'CASCADE' })
  reef: Reef;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
