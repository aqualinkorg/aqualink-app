import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { GeoJSON } from 'geojson';
import { ApiProperty } from '@nestjs/swagger';
import { ApiPointProperty } from '../docs/api-properties';

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ApiPointProperty()
  @Column({
    type: 'geometry',
    unique: true,
    srid: 4326,
  })
  @Index({ spatial: true })
  polygon: GeoJSON;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ApiProperty({ type: () => Region })
  @ManyToOne(() => Region, { onDelete: 'CASCADE', nullable: true })
  parent?: Region;

  @RelationId((region: Region) => region.parent)
  parentId?: number;
}
