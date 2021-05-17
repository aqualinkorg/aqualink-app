import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { GeoJSON } from 'geojson';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class VideoStream {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'some@example.com' })
  @Column()
  ownerEmail: string;

  @Column('point')
  @Index({ spatial: true })
  location: GeoJSON;

  @ApiProperty({ example: 'http://some-sample-url.com' })
  @Column()
  url: string;

  @Column({ default: 1 })
  quality: number;

  @Column()
  important: boolean;

  @Column()
  hidden: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
