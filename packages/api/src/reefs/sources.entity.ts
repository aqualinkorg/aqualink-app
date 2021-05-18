import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from './reefs.entity';

export enum SourceType {
  SPOTTER = 'spotter',
  HOBO = 'hobo',
  NOAA = 'noaa',
  GFS = 'gfs',
}

@Entity()
@Unique('no_duplicate_sources', ['reef', 'poi', 'type'])
@Index(['reef', 'type'], { unique: true, where: '"poi_id" IS NULL' })
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
