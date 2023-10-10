import { random, times } from 'lodash';
import { DeepPartial } from 'typeorm';
import { DateTime } from '../../src/luxon-extensions';
import { DailyData } from '../../src/sites/daily-data.entity';
import { Site } from '../../src/sites/sites.entity';
import { SpotterData } from '../../src/utils/sofar.types';
import { athensSite, californiaSite } from './site.mock';

const getMockDailyData = (
  date: string,
  site: DeepPartial<Site>,
): DeepPartial<DailyData> => ({
  dailyAlertLevel: random(4),
  degreeHeatingDays: random(70, true),
  date,
  site,
  satelliteTemperature: random(15, 35, true),
});

export const getMockSpotterData = (
  startDate: Date,
  endDate: Date,
): SpotterData => {
  const start = DateTime.fromJSDate(startDate);
  const end = DateTime.fromJSDate(endDate);
  const diffDays = end.diff(start, 'days').days;

  return {
    bottomTemperature: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(15, 35, true),
    })),
    topTemperature: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(15, 35, true),
    })),
    significantWaveHeight: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(15, 35, true),
    })),
    waveMeanPeriod: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(15, 35, true),
    })),
    waveMeanDirection: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(359),
    })),
    windSpeed: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(10, true),
    })),
    windDirection: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(359),
    })),
    latitude: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(-90, 90, true),
    })),
    longitude: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(-180, 180, true),
    })),
    barometerTop: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(900, 1100, true),
    })),
    barometerBottom: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(900, 1100, true),
    })),
    barometricTopDiff: [],
    surfaceTemperature: times(diffDays, (i) => ({
      timestamp: start.plus({ days: i }).toISOString(),
      value: random(900, 1100, true),
    })),
  };
};

export const californiaDailyData: DeepPartial<DailyData>[] = times(10, (i) => {
  const dataDate = DateTime.now().minus({ days: i }).endOf('day').toISOString();
  return getMockDailyData(dataDate, californiaSite);
});

export const athensDailyData: DeepPartial<DailyData>[] = times(10, (i) => {
  const dataDate = DateTime.now().minus({ days: i }).endOf('day').toISOString();
  return getMockDailyData(dataDate, athensSite);
});

export const dailyData = [...californiaDailyData, ...athensDailyData];
