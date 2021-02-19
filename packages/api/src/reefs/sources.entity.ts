import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Reef } from './reefs.entity';

export enum SourceType {
  SPOTTER = 'spotter',
  HOBO = 'hobo',
  SOFAR_API = 'sofar_api',
}

@Entity()
export class Sources {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Reef, { onDelete: 'CASCADE' })
  reef: Reef;

  @Column({ type: 'enum', enum: SourceType })
  type: SourceType;

  @Column('float', { nullable: true })
  depth: number;

  @Column({ nullable: true })
  spotterId: string;
}
