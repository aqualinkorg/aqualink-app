import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum Metric {
  ALERT = 'alert',
  WEEKLY_ALERT = 'weekly_alert',
  DHW = 'dhw',
  SATELLITE_TEMPERATURE = 'satellite_temperature',
  TOP_TEMPERATURE = 'top_temperature',
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
  @ApiProperty({ example: 1 })
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'enum', enum: Metric, nullable: false })
  metric: Metric;

  @ApiProperty({ example: 'Metric Description' })
  @Column({ nullable: false })
  description: string;

  @Column({ type: 'enum', enum: Units, nullable: false })
  units: Units;
}
