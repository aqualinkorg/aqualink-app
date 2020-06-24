import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum AdminLevel {
  Default = 'default',
  ReefManager = 'reef_manager',
  SuperAdmin = 'super_admin',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 128 })
  firebaseUid: string;

  @Column({ length: 50 })
  fullName: string;

  @Column({ length: 254 })
  email: string;

  @Column({ length: 50 })
  organization: string;

  @Column({ type: 'point', nullable: true })
  @Index({ spatial: true })
  location?: string;

  @Column({ length: 50, nullable: true })
  country?: string;

  @Column({
    type: 'enum',
    enum: AdminLevel,
    default: AdminLevel.Default,
  })
  adminLevel: AdminLevel;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
