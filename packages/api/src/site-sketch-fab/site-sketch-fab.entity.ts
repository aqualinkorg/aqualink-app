import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  RelationId,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Site } from '../sites/sites.entity';

@Entity()
export class SiteSketchFab {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Site, { onDelete: 'CASCADE', nullable: false })
  site: Site;

  @ApiProperty({ example: 1 })
  @RelationId((surveyPoint: SiteSketchFab) => surveyPoint.site)
  siteId: number;

  @ApiProperty({ example: 'Some description' })
  @Column({ nullable: true, type: 'character varying' })
  description: string | null;

  @ApiProperty({ example: 1 })
  @Column({ default: 1 })
  scale: number;

  @ApiProperty({ example: 'Some description' })
  @Column()
  uuid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
