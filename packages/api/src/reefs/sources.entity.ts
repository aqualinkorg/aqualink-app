import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ReefPointOfInterest } from '../reef-pois/reef-pois.entity';
import { Reef } from './reefs.entity';
import { SourceType } from './schemas/source-type.enum';

@Entity()
// Typeorm does not allow to add raw SQL on column declaration
// So we will edit the query on the migration
// CREATE UNIQUE INDEX "no_duplicate_sources" ON "sources" ("reef_id", COALESCE("poi_id", 0), "type", COALESCE("sensor_id", 'SPOT-IMPOSSIBLE'))
@Index('no_duplicate_sources', ['reef', 'poi', 'type', 'sensorId'], {
  unique: true,
})
export class Sources {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @ManyToOne(() => ReefPointOfInterest, { onDelete: 'CASCADE', nullable: true })
  poi: ReefPointOfInterest | null;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @ApiProperty({ example: 12 })
  @Column('float', { nullable: true })
  depth: number | null;

  @ApiProperty({ example: 'SPOT-0000' })
  @Column({ nullable: true, type: 'character varying' })
  sensorId: string | null;
}
