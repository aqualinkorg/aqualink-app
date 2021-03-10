import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Metric {
  ALERT = 'alert',
  DHW = 'dhw',
  SATELLITE_TEMPERATURE = 'satellite_temperature',
  SURFACE_TEMPERATURE = 'surface_temperature',
  BOTTOM_TEMPERATURE = 'bottom_temperature',
  SST_ANOMALY = 'sst_anomaly',
}

export enum Units {
  CELSIUS = 'celsius',
  METERS = 'm',
  METERS_PER_SECOND = 'm/s',
  DHW = 'dhw',
}

@Entity()
export class Metrics {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Metric })
  metric: Metric;

  @Column()
  description: string;

  @Column({ type: 'enum', enum: Units })
  units: Units;
}
