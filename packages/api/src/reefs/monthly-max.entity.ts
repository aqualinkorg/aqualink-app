import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
} from 'typeorm';
import { Reef } from './reefs.entity';

@Entity()
export class MonthlyMax {
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
