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
@Unique('no_duplicate_reef_sources', ['reef', 'type'])
export class Sources {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE', nullable: true })
  poi: ReefPointOfInterest;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @Column('float', { nullable: true })
  depth: number;

  @Column({ nullable: true })
  spotterId: string;
}
