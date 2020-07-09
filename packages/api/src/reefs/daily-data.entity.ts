import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reef } from './reefs.entity';

@Entity()
export class DailyData {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @Column('float')
  minBottomTemperature: number;

  @Column('float')
  maxBottomTemperature: number;

  @Column('float')
  avgBottomTemperature: number;

  @Column('float')
  degreeHeatingDays: number;

  @Column('float')
  surfaceTemperature: number;

  @Column('float')
  satelliteTemperature: number;

  @Column('float')
  minWaveHeight: number;

  @Column('float')
  maxWaveHeight: number;

  @Column('float')
  avgWaveHeight: number;

  @Column()
  waveDirection: number;

  @Column()
  wavePeriod: number;

  @Column('float')
  minWindSpeed: number;

  @Column('float')
  maxWindSpeed: number;

  @Column('float')
  avgWindSpeed: number;

  @Column()
  windDirection: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reef: Reef;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
