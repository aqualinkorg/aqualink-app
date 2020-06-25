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

@Entity()
export class Region {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column('geometry', { spatialFeatureType: 'Polygon' })
  @Index({ spatial: true })
  polygon: string;

  @ManyToOne(() => Region, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parentId: Region | number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
