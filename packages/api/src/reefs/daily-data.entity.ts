import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reef } from './reefs.entity';

@Entity()
export class DailyData {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @ApiProperty({ example: 30 })
  @Column('float', { nullable: true })
  minBottomTemperature?: number;

  @ApiProperty({ example: 32 })
  @Column('float', { nullable: true })
  maxBottomTemperature?: number;

  @ApiProperty({ example: 31 })
  @Column('float', { nullable: true })
  avgBottomTemperature?: number;

  @ApiProperty({ example: 20 })
  @Column('float', { nullable: true })
  degreeHeatingDays?: number;

  @ApiProperty({ example: 22 })
  @Column('float', { nullable: true })
  topTemperature?: number;

  @ApiProperty({ example: 21 })
  @Column('float', { nullable: true })
  satelliteTemperature?: number;

  @ApiProperty({ example: 2 })
  @Column('float', { nullable: true })
  minWaveHeight?: number;

  @ApiProperty({ example: 4 })
  @Column('float', { nullable: true })
  maxWaveHeight?: number;

  @ApiProperty({ example: 3 })
  @Column('float', { nullable: true })
  avgWaveHeight?: number;

  @ApiProperty({ example: 279 })
  @Column({ nullable: true })
  waveDirection?: number;

  @ApiProperty({ example: 11 })
  @Column({ nullable: true })
  wavePeriod?: number;

  @ApiProperty({ example: 1 })
  @Column('float', { nullable: true })
  minWindSpeed?: number;

  @ApiProperty({ example: 3 })
  @Column('float', { nullable: true })
  maxWindSpeed?: number;

  @ApiProperty({ example: 2 })
  @Column('float', { nullable: true })
  avgWindSpeed?: number;

  @ApiProperty({ example: 1 })
  @Column({ nullable: true })
  windDirection?: number;

  @ApiProperty({ example: 5 })
  @Column('integer', { nullable: true })
  dailyAlertLevel?: number;

  @ApiProperty({ example: 5 })
  @Column('integer', { nullable: true })
  weeklyAlertLevel?: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
