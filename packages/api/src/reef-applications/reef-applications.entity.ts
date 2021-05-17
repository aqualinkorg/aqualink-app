import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Reef } from '../reefs/reefs.entity';
import { User } from '../users/users.entity';
import { hashId } from '../utils/urls';

@Entity()
export class ReefApplication {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Permit Requirements' })
  @Column({ nullable: true })
  permitRequirements?: string;

  @ApiProperty({ example: 'Funding Source' })
  @Column({ nullable: true })
  fundingSource?: string;

  @ApiProperty({ example: 'Installation Schedule' })
  @Column({ nullable: true })
  installationSchedule?: Date;

  @ApiProperty({ example: 'Installation Resource' })
  @Column({ nullable: true })
  installationResources?: string;

  @ApiProperty({ example: 'Target Shipdate' })
  @Column({ nullable: true })
  targetShipdate?: Date;

  @ApiProperty({ example: 'Tracking URL' })
  @Column({ nullable: true })
  trackingUrl?: string;

  @Exclude()
  @Column({ default: () => 'gen_random_uuid()', unique: true })
  uid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Reef, { onDelete: 'CASCADE' })
  @JoinColumn()
  reef: Reef;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Expose()
  get appId(): string {
    return hashId(this.id);
  }

  @Expose()
  get applied(): boolean {
    return !!this.permitRequirements;
  }
}
