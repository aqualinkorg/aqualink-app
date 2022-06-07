import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
  UpdateDateColumn,
} from 'typeorm';
import { Site } from '../sites/sites.entity';
import { User } from '../users/users.entity';

export type DynamicCollection = Omit<
  Collection,
  'id' | 'user' | 'userId' | 'createdAt' | 'updatedAt'
>;

@Entity()
export class Collection {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'La Niña heatwave 20/21' })
  @Column({ nullable: false })
  name: string;

  @Column({ nullable: false, default: false })
  isPublic: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
  user: User;

  @ApiProperty({ example: 1 })
  @RelationId((collection: Collection) => collection.user)
  userId: number;

  @ManyToMany(() => Site)
  @JoinTable()
  sites: Site[];

  @ApiProperty({ example: [1, 2, 3] })
  @RelationId((collection: Collection) => collection.sites)
  siteIds: number[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
