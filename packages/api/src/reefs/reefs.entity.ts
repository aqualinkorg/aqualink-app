import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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
  regionId: number;

  @Column()
  temperatureThreshold: number;

  @Column()
  depth: number;

  @Column()
  status: string;

  @Column()
  adminId: number;

  @Column({ nullable: true })
  videoStream: string;

  @Column()
  streamId: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
