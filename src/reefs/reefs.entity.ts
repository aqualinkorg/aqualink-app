import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
export class Reef {
   @PrimaryGeneratedColumn()
   id: number;

   @Column({length: 50})
   name: string;

   @Column("polygon")
   @Index({ spatial: true })
   polygon: string;

   @Column()
   region_id: number;

   @Column()
   temperature_threshold: number;

   @Column()
   depth: number;
   
   @Column()
   status: string;

   @Column()
   admin_id: number;

   @Column({nullable: true})
   video_stream: string;

   @Column()
   stream_id: number;

   @Column()
   created_at: Date;

   @Column()
   updated_at: Date;  
}
