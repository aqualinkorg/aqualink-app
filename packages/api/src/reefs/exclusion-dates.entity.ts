import { Column, Entity, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique('no_duplicates_exclusion_dates', ['spotterId', 'date'])
export class ExclusionDates {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  spotterId: string;

  @Column()
  date: Date;
}
