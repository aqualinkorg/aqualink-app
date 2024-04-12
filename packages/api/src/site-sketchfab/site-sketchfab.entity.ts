import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
  Index,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Site } from '../sites/sites.entity';

@Entity()
export class SketchFab {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @OneToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn()
  @Index()
  site: Site;

  @ApiProperty({ example: 1 })
  @RelationId((surveyPoint: SketchFab) => surveyPoint.site)
  siteId: number;

  @ApiProperty({ example: 'A 3D model of Keahole Reef in Hawai' })
  @Column({ nullable: true, type: 'character varying' })
  description: string | null;

  @ApiProperty({ example: 1 })
  @Column({ default: 1 })
  scale: number;

  @ApiProperty({ example: '0fd310d08bd6472db293f574da0e200b' })
  @Column()
  uuid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
