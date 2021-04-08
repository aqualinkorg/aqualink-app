import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  Unique,
} from 'typeorm';
import { Reef } from './reefs.entity';

@Entity()
@Unique('UQ_MONTHS', ['reef', 'month'])
export class HistoricalMonthlyMean {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'integer' })
  month: number;

  @Column({ type: 'float' })
  temperature: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @UpdateDateColumn()
  updatedAt: Date;
}
