/* eslint-disable no-console */
import { Point } from 'geojson';
import { isNil, omitBy, sortBy } from 'lodash';
import moment from 'moment';
import { Site } from '../sites/sites.entity';
import { SofarModels, sofarVariableIDs } from './constants';
import { getLatestData, getSofarHindcastData, getSpotterData } from './sofar';
import { SofarLiveData, ValueWithTimestamp } from './sofar.types';
import { getDegreeHeatingDays } from '../workers/dailyData';
import { calculateAlertLevel } from './bleachingAlert';
import { HistoricalMonthlyMean } from '../sites/historical-monthly-mean.entity';

export const getLiveData = async (
  site: Site,
  isDeployed: boolean,
): Promise<SofarLiveData> => {
  console.time(`getLiveData for site ${site.id}`);
  const { polygon, sensorId, maxMonthlyMean } = site;
  // TODO - Accept Polygon option
  const [longitude, latitude] = (polygon as Point).coordinates;

  const now = new Date();

  const [spotterRawData, degreeHeatingDays, satelliteTemperature] =
    await Promise.all([
      sensorId && isDeployed ? getSpotterData(sensorId) : undefined,
      getDegreeHeatingDays(latitude, longitude, now, maxMonthlyMean),
      getSofarHindcastData(
        SofarModels.NOAACoralReefWatch,
        sofarVariableIDs[SofarModels.NOAACoralReefWatch]
          .analysedSeaSurfaceTemperature,
        latitude,
        longitude,
        now,
        96,
      ),
    ]);

  const spotterData = spotterRawData
    ? {
        topTemperature: getLatestData(spotterRawData.topTemperature),
        bottomTemperature: getLatestData(spotterRawData.bottomTemperature),
        longitude:
          spotterRawData.longitude && getLatestData(spotterRawData.longitude),
        latitude:
          spotterRawData.latitude && getLatestData(spotterRawData.latitude),
      }
    : {};

  const filteredValues = omitBy(
    {
      degreeHeatingDays,
      satelliteTemperature:
        satelliteTemperature && getLatestData(satelliteTemperature),
      // Override all possible values with spotter data.
      ...spotterData,
    },
    (data) => isNil(data?.value) || data?.value === 9999,
  );

  const dailyAlertLevel = calculateAlertLevel(
    maxMonthlyMean,
    filteredValues?.satelliteTemperature?.value,
    degreeHeatingDays?.value,
  );

  console.timeEnd(`getLiveData for site ${site.id}`);

  return {
    site: { id: site.id },
    ...filteredValues,
    ...(spotterData.longitude &&
      spotterData.latitude && {
        spotterPosition: {
          longitude: spotterData.longitude,
          latitude: spotterData.latitude,
        },
      }),
    dailyAlertLevel,
  };
};

/**
 * The daily global 5km SSTA product requires a daily climatology to calculate the daily SST anomalies.
 * Daily climatologies (DC) are derived from the monthly mean (MM) climatology via linear interpolation.
 * To achieve this, we assigned the MM value to the 15th day of each corresponding month, with the individual
 * days between these dates being derived using linear interpolation. We then calculate the SSTA product using:
 *
 * ST_anomaly = SST - DC
 *
 * where the SST is the value for the day in question, and DC is the corresponding daily climatology for that
 * day of the year.
 * */
export const getSstAnomaly = (
  historicalMonthlyMean: HistoricalMonthlyMean[],
  satelliteTemperature?: ValueWithTimestamp,
) => {
  if (historicalMonthlyMean.length < 12 || !satelliteTemperature?.value) {
    return undefined;
  }

  const orderedMontlyMax = sortBy(historicalMonthlyMean, 'month');
  const now = moment().startOf('day');

  // The date of the previous value. Subtract 15 days from the current date
  // and see in which month the result falls. The date we are looking for is
  // the 15th day of this month.
  const previousDate = now
    .clone()
    .subtract(15, 'days')
    .set('date', 15)
    .startOf('day');

  // The date of the next value. It must fall on the next month of the previous
  // value.
  const nextDate = previousDate.clone().add(1, 'month');

  // We can index `orderedMontlyMax` with `moment.get('month')` since it returns
  // a value between 0 and 11, with 0 corresponding to January and 11 corresponding to December
  const previousValue = orderedMontlyMax[previousDate.get('month')].temperature;
  const previousDistance = now.diff(previousDate, 'days');
  const nextValue = orderedMontlyMax[nextDate.get('month')].temperature;
  const nextDistance = nextDate.diff(now, 'days');
  const deltaDays = previousDistance + nextDistance;

  const interpolated =
    previousValue * (1 - previousDistance / deltaDays) +
    nextValue * (1 - nextDistance / deltaDays);

  return satelliteTemperature.value - interpolated;
};
