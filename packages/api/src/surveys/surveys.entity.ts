import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm';
// eslint-disable-next-line import/no-cycle
import { Reef } from '../reefs/reefs.entity';
import { User } from '../users/users.entity';
// eslint-disable-next-line import/no-cycle
import { DailyData } from '../reefs/daily-data.entity';

export enum WeatherConditions {
  Calm = 'calm',
  Wavy = 'wavy',
  Stormy = 'stormy',
}

@Entity()
export class Survey {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column({
    name: 'weather_conditions',
    type: 'enum',
    enum: WeatherConditions,
  })
  weatherConditions: WeatherConditions;

  @Column('float', { nullable: true })
  temperature?: number;

  @Column('text', { nullable: true })
  comments?: string;

  @Column()
  diveDate: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  userId?: User;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reef?: Reef;

  @CreateDateColumn()
  createdAt?: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  latestDailyData?: DailyData;
}
