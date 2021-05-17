import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ExclusionDates {
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ example: 'SPOT-0000' })
  @Column()
  spotterId: string;

  // The start of the exclusive range. Inclusive
  @Column({ nullable: true })
  startDate?: Date;

  // The end of the exclusive range. Inclusive
  @Column()
  endDate: Date;
}
