import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from '../sites/sites.entity';

@Entity()
@Unique('one_row_per_site', ['site'])
@Index(['timestamp'])
export class ForecastData {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  site: Site;

  @Column({ nullable: false })
  timestamp: Date;

  @Column({ type: 'float', nullable: true })
  significantWaveHeight: number;

  @Column({ type: 'float', nullable: true })
  meanDirection: number;

  @Column({ type: 'float', nullable: true })
  meanPeriod: number;

  @Column({ type: 'float', nullable: true })
  windSpeed: number;

  @Column({ type: 'float', nullable: true })
  windDirection: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
