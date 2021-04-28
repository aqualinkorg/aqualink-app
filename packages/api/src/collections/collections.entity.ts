import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Reef } from '../reefs/reefs.entity';
import { User } from '../users/users.entity';

export interface CollectionData {
  bottomTemperature: number | undefined;
  topTemperature: number | undefined;
  satelliteTemperature: number | undefined;
  degreeHeatingDays: number | undefined;
  weeklyAlertLevel: number | undefined;
  sstAnomaly: number | undefined;
}

@Entity()
export class Collection {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, default: false })
  isPublic: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @RelationId((collection: Collection) => collection.user)
  userId: number;

  @ManyToMany(() => Reef)
  @JoinTable()
  reefs: Reef[];

  @RelationId((collection: Collection) => collection.reefs)
  reefIds: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
