import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  Index,
  Generated,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { Site } from '../sites/sites.entity';
import { User } from '../users/users.entity';
import { hashId } from '../utils/urls';

@Entity()
export class SiteApplication {
  @ApiProperty({ example: 1 })
  @Exclude()
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'Permit Requirements' })
  @Column({ nullable: true, type: 'character varying' })
  permitRequirements: string | null;

  @ApiProperty({ example: 'Funding Source' })
  @Column({ nullable: true, type: 'character varying' })
  fundingSource: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  installationSchedule: Date | null;

  @ApiProperty({ example: 'Installation Resource' })
  @Column({ nullable: true, type: 'character varying' })
  installationResources: string | null;

  @Column({ nullable: true, type: 'timestamp' })
  targetShipdate: Date | null;

  @ApiProperty({ example: 'Tracking URL' })
  @Column({ nullable: true, type: 'character varying' })
  trackingUrl: string | null;

  @Exclude()
  @Column({ unique: true })
  @Generated('uuid')
  uid: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Site, { onDelete: 'CASCADE' })
  @JoinColumn()
  @Index()
  site: Site;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @Index()
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
