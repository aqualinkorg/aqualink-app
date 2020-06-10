import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reef } from './reefs.entity';
import { User } from '../users/users.entity';

@Entity()
export class MonthlyTemperatureThreshold {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  month: number;

  @Column()
  temperatureThreshold: number;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reefId: Reef;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_update' })
  userUpdate: User;
}
