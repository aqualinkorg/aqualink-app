import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ExclusionDates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  spotterId: string;

  // The start of the exclusive range. Inclusive
  @Column({ nullable: true })
  startDate: Date;

  // The end of the exclusive range. Inclusive
  @Column()
  endDate: Date;
}
