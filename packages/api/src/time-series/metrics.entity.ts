import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Metric {
  ALERT = 'alert',
  DHW = 'dhw',
  SATELLITE_TEMPERATURE = 'satellite_temperature',
  SURFACE_TEMPERATURE = 'surface_temperature',
  BOTTOM_TEMPERATURE = 'bottom_temperature',
  SST_ANOMALY = 'sst_anomaly',
  SIGNIFICANT_WAVE_HEIGHT = 'significant_wave_height',
  WAVE_PEAK_PERIOD = 'wave_peak_period',
  WAVE_MEAN_DIRECTION = 'wave_mean_direction',
  WIND_SPEED = 'wind_speed',
  WIND_DIRECTION = 'wind_direction',
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

  @Column({ type: 'enum', enum: Metric, nullable: false })
  metric: Metric;

  @Column({ nullable: false })
  description: string;

  @Column({ type: 'enum', enum: Units, nullable: false })
  units: Units;
}
