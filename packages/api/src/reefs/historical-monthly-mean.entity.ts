import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  UpdateDateColumn,
  Unique,
  RelationId,
} from 'typeorm';
import { Reef } from './reefs.entity';

@Entity()
@Unique('UQ_MONTHS', ['reef', 'month'])
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
      historicalMonthlyMean.reef,
  )
  reefId: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @UpdateDateColumn()
  updatedAt: Date;
}
