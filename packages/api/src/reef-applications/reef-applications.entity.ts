import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { User } from '../users/users.entity';

@Entity()
export class ReefApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  permitRequirements: string;

  @Column({ nullable: true })
  fundingSource: string;

  @Column({ nullable: true })
  installationSchedule: Date;

  @Column({ nullable: true })
  installationResources: string;

  @Column({ length: 128 })
  uid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'reef_id' })
  reefId: Reef | number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  userId: User | number;
}
