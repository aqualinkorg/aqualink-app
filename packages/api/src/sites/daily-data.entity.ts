import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';
import { Site } from './sites.entity';

@Entity()
@Unique('no_duplicated_date', ['site', 'date'])
export class DailyData {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: Date;

  @ApiProperty({ example: 20 })
  @Column('float', { nullable: true })
  degreeHeatingDays: number | null;

  @ApiProperty({ example: 21 })
  @Column('float', { nullable: true })
  satelliteTemperature: number | null;

  @ApiProperty({ example: 5 })
  @Column('integer', { nullable: true })
  dailyAlertLevel: number | null;

  @ApiProperty({ example: 5 })
  @Column('integer', { nullable: true })
  weeklyAlertLevel: number | null;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @Index()
  site: Site;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
