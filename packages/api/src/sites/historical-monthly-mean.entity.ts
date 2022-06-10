import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  Unique,
  RelationId,
  Index,
} from 'typeorm';
import { Site } from './sites.entity';

@Entity()
@Unique('UQ_MONTHS', ['site', 'month'])
export class HistoricalMonthlyMean {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 1, minimum: 1, maximum: 12 })
  @Column({ type: 'integer' })
  month: number;

  @ApiProperty({ example: 24.21 })
  @Column({ type: 'float' })
  temperature: number;

  @RelationId(
    (historicalMonthlyMean: HistoricalMonthlyMean) =>
      historicalMonthlyMean.site,
  )
  siteId: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE' })
  @Index()
  site: Site;

  @UpdateDateColumn()
  updatedAt: Date;
}
