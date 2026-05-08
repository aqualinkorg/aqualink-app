/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable import/no-unresolved */
/* eslint-disable global-require */
import { times } from 'lodash';
import { DateTime } from 'luxon';

// eslint-disable-next-line fp/no-mutation
let netcdf4: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  // eslint-disable-next-line fp/no-mutation
  netcdf4 = require('netcdf4');
} catch {
  // eslint-disable-next-line fp/no-mutation
  netcdf4 = null;
}

/**
 * Get NOAA SST data for a given longitude, latitude, and year.
 * Reads from NOAA OI SST V2 High Resolution Dataset NetCDF files.
 * Files should be stored in the data/ directory.
 * Supports both legacy naming (sst.day.mean.{year}.v2.nc) and
 * current naming (sst.day.mean.{year}.nc).
 * @param long
 * @param lat
 * @param year
 */
export function getNOAAData(long: number, lat: number, year: number = 2020) {
  const basePath = `data/sst.day.mean.${year}`;
  const configuredSuffix = process.env.NOAA_SST_SUFFIX;
  const suffixes = configuredSuffix ? [configuredSuffix] : ['.v2.nc', '.nc'];

  let noaaData: any;
  let lastError: unknown;

  // eslint-disable-next-line no-restricted-syntax
  for (const suffix of suffixes) {
    const fileName = `${basePath}${suffix}`;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      // eslint-disable-next-line fp/no-mutation
      noaaData = new netcdf4.File(fileName, 'r');
      break;
    } catch (err) {
      // eslint-disable-next-line fp/no-mutation
      lastError = err;
    }
  }

  if (!noaaData) {
    throw lastError;
  }

  const { dimensions, variables } = noaaData.root;

  const width = dimensions.lon.length;
  const height = dimensions.lat.length;
  const days = dimensions.time.length;

  const longIndex = Math.round(((long + 180) / 360) * width);
  const latIndex = Math.round(((lat + 90) / 180) * height);

  return times(days, (i) => {
    const rawValue = variables.sst.read(i, latIndex, longIndex);
    const value = rawValue === -999 ? null : rawValue * 0.01;
    const date = DateTime.fromObject(
      { year, month: 1, day: 1 },
      { zone: 'UTC' },
    )
      .plus({ days: i })
      .toJSDate();

    return { date, satelliteTemperature: value };
  });
}
