import { GeoJSON } from 'geojson';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Reef } from '../reefs/reefs.entity';
import { ApiPointProperty } from '../docs/api-properties';

export enum AdminLevel {
  Default = 'default',
  ReefManager = 'reef_manager',
  SuperAdmin = 'super_admin',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Exclude()
  @Column({ nullable: true })
  firebaseUid?: string;

  @Column({ nullable: true })
  fullName?: string;

  @Column()
  @Index({ unique: true })
  email: string;

  @Column({ nullable: true })
  organization?: string;

  @ApiPointProperty()
  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    nullable: true,
    srid: 4326,
  })
  @Index({ spatial: true })
  location?: GeoJSON;

  @Column({ nullable: true })
  country?: string;

  @Column({
    type: 'enum',
    enum: AdminLevel,
    default: AdminLevel.Default,
    nullable: false,
  })
  adminLevel: AdminLevel;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @ManyToMany(() => Reef, (reef) => reef.admins, { cascade: true })
  @JoinTable()
  administeredReefs: Reef[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
