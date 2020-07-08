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
import { Reef } from '../reefs/reefs.entity';

@Entity()
export class Spotter {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @Index({ unique: true })
  sofarName: string;

  @Column('point')
  @Index({ spatial: true })
  location: string;

  @Column()
  hardwareVersion: string;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reefId: Reef;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
