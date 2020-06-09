import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class Reef {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column('polygon')
  @Index({ spatial: true })
  polygon: string;

  @Column()
  // eslint-disable-next-line camelcase
  region_id: number;

  @Column()
  // eslint-disable-next-line camelcase
  temperature_threshold: number;

  @Column()
  depth: number;

  @Column()
  status: string;

  @Column()
  // eslint-disable-next-line camelcase
  admin_id: number;

  @Column({ nullable: true })
  // eslint-disable-next-line camelcase
  video_stream: string;

  @Column()
  // eslint-disable-next-line camelcase
  stream_id: number;

  @Column()
  // eslint-disable-next-line camelcase
  created_at: Date;

  @Column()
  // eslint-disable-next-line camelcase
  updated_at: Date;
}
