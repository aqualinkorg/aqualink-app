import { times } from 'lodash';
import { DateTime } from 'luxon';
import { Extent, pointToIndex } from '../../src/utils/coordinates';

let netcdf4;
try {
  // eslint-disable-next-line global-require, fp/no-mutation, import/no-unresolved
  netcdf4 = require('netcdf4');
} catch {
  console.error(
    'NetCDF is not installed. Please install NetCDF before continuing',
  );
  process.exit();
}
/**
 * Generate NOAA SST data for a year at a speciic location.
 * This script assumes that the necessary NETCDF data files are
 * available in /api/data/
 *
 * The files used come from https://psl.noaa.gov/cgi-bin/db_search/DBListFiles.pl?did=132&tid=91426&vid=2423
 * Look for the "NOAA OI SST V2 High Resolution Dataset" and download SST daily data.
 *
 * @param year
 * @param long
 * @param lat
 */
export function getNOAAData(long: number, lat: number, year: number = 2020) {
  const fileName = `data/sst.day.mean.${year}.v2.nc`;
  const noaaData = new netcdf4.File(fileName, 'r');
  const { dimensions, variables } = noaaData.root;

  const width = dimensions.lon.length;
  const height = dimensions.lat.length;
  const dateRange = dimensions.time.length;

  const boundingBox = [0.125, -89.875, 359.875, 89.875] as Extent;

  const { indexLong, indexLat } = pointToIndex(
    long,
    lat,
    boundingBox,
    width,
    height,
  );

  const startDate = DateTime.fromJSDate(new Date(year, 0, 1));

  return times(dateRange, (dateIndex) => {
    const date = startDate.set({ day: startDate.day + dateIndex });
    const data: number[] = variables.sst.readSlice(
      dateIndex,
      1,
      indexLat,
      10,
      indexLong,
      10,
    );
    const filteredData = data.filter((value) => value <= 9999999);
    return { date: date.toJSDate(), satelliteTemperature: filteredData[0] };
  });
}
