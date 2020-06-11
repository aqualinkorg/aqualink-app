import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class VideoStream {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 254 })
  ownerEmail: string;

  @Column('point')
  @Index({ spatial: true })
  location: string;

  @Column()
  url: string;

  @Column({ default: 1 })
  quality: number;

  @Column()
  important: boolean;

  @Column()
  hidden: boolean;
}
