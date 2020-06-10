import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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
  location: string;

  @Column({ length: 50 })
  hardwareVersion: string;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reefId: Reef;
}
