import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from './reefs.entity';

export enum SourceType {
  SPOTTER = 'spotter',
  HOBO = 'hobo',
  SOFAR_API = 'sofar_api',
}

@Entity()
@Unique('no_duplicate_sources', ['reef', 'poi', 'type'])
export class Sources {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE', nullable: true })
  poi: ReefPointOfInterest;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @ApiProperty({ example: 12 })
  @Column('float', { nullable: true })
  depth: number;

  @ApiProperty({ example: 'SPOT-0000' })
  @Column({ nullable: true })
  spotterId: string;
}
