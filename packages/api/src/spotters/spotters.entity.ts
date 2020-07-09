import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeoJSON } from 'geojson';
import { Reef } from '../reefs/reefs.entity';

@Entity()
export class Spotter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  @Index({ unique: true })
  sofarName: string;

  @Column('point')
  @Index({ spatial: true })
  location: GeoJSON;

  @Column({ length: 50 })
  hardwareVersion: string;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reefId: Reef;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
