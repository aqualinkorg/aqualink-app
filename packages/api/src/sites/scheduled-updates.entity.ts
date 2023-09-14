import { ApiProperty } from '@nestjs/swagger';
import { Entity, PrimaryGeneratedColumn, ManyToOne, Index } from 'typeorm';
import { Site } from './sites.entity';

@Entity()
export class ScheduledUpdate {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  @Index()
  site: Site;
}
