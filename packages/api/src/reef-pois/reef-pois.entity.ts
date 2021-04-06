import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  RelationId,
} from 'typeorm';
import { GeoJSON } from 'geojson';
import { Reef } from '../reefs/reefs.entity';
import { PointApiProperty } from '../docs/api-properties';

@Entity()
export class ReefPointOfInterest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  poiLabelId?: number;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column({ nullable: false })
  name: string;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE', nullable: false })
  reef: Reef;

  @RelationId((poi: ReefPointOfInterest) => poi.reef)
  reefId: number;

  @PointApiProperty()
  @Column({
    type: 'geometry',
    unique: true,
    srid: 4326,
    nullable: true,
  })
  @Index({ spatial: true })
  polygon?: GeoJSON;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
