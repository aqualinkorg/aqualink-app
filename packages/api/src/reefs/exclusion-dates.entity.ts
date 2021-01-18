import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique('no_duplicates_start_date', ['spotterId', 'startDate'])
@Unique('no_duplicate_end_date', ['spotterId', 'endDate'])
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
