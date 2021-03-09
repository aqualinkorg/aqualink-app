import moment from 'moment';
import { Extent, pointToPixel } from '../../src/utils/coordinates';

// eslint-disable-next-line import/no-extraneous-dependencies
const netcdf4 = require('netcdf4');

/**
 * Generate NOAA SST data for a year at a speciic location.
 * This script assumes that the necessary NETCDF data files are
 * available in /api/data/
 *
 * The files used come from https://psl.noaa.gov/cgi-bin/db_search/DBListFiles.pl?did=132&tid=91426&vid=2423
 *
 * @param year
 * @param long
 * @param lat
 */
export function getNOAAData(year: number = 2020, long: number, lat: number) {
  const fileName = `data/sst.day.mean.${year}.nc`;
  const noaaData = new netcdf4.File(fileName, 'r');
  const { dimensions, variables } = noaaData.root;

  const width = dimensions.lon.length;
  const height = dimensions.lat.length;
  const dateRange = dimensions.time.length;

  const [minLong, maxLong] = variables.lon.attributes.actual_range.value;
  const [minLat, maxLat] = variables.lat.attributes.actual_range.value;
  const boundingBox = [minLong, minLat, maxLong, maxLat] as Extent;

  const { pixelX, pixelY } = pointToPixel(
    long,
    lat,
    boundingBox,
    width,
    height,
  );

  const dateIndexArray = Array.from(Array(dateRange).keys());
  const startDate = moment(new Date(year, 0, 1));

  return dateIndexArray.map((dateIndex) => {
    const date = moment(startDate);
    date.day(startDate.day() + dateIndex);
    const data: number[] = variables.sst.readSlice(
      dateIndex,
      1,
      pixelY,
      10,
      pixelX,
      10,
    );
    const filteredData = data.filter((value) => value <= 9999999);
    return { date: date.toDate(), satelliteTemperature: filteredData[0] };
  });
}
