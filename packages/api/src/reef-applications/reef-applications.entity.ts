import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
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

  @Column({ length: 128, default: () => 'gen_random_uuid()', unique: true })
  uid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn()
  reef: Reef;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
