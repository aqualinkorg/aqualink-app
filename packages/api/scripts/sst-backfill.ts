import { In } from 'typeorm';
import Bluebird from 'bluebird';
import { Point } from 'geojson';
import { keyBy } from 'lodash';
import { Site } from '../src/sites/sites.entity';
import { getNOAAData } from './utils/netcdf';
import { DailyData } from '../src/sites/daily-data.entity';
import { Sources } from '../src/sites/sources.entity';
import {
  getNOAASource,
  insertSiteDataToTimeSeries,
  refreshMaterializedView,
} from '../src/utils/time-series.utils';
import { TimeSeries } from '../src/time-series/time-series.entity';
import AqualinkDataSource from '../ormconfig';
import { Metric } from '../src/time-series/metrics.enum';

// Sites and years to backfill SST for
const yearsArray = [2017, 2018, 2019, 2020, 2021, 2022];
const sitesToProcess: number[] = [];

async function main() {
  const connection = await AqualinkDataSource.initialize();
  const siteRepository = connection.getRepository(Site);
  const dailyDataRepository = connection.getRepository(DailyData);
  const sourcesRepository = connection.getRepository(Sources);
  const timeSeriesRepository = connection.getRepository(TimeSeries);
  const selectedSites = await siteRepository.find({
    where:
      sitesToProcess.length > 0
        ? {
            id: In(sitesToProcess),
          }
        : {},
  });

  const dailyDataEntities = selectedSites.reduce(
    (entities: DailyData[], site) => {
      console.log(`Processing site ${site.name || site.id}...`);
      const allYearEntities = yearsArray.reduce(
        (yearEntities: DailyData[], year) => {
          console.log(`Processing year ${year}...`);
          const [longitude, latitude] = (site.polygon as Point).coordinates;
          const data = getNOAAData(longitude, latitude, year);
          const yearEntitiesForSite = data.map(
            ({ date, satelliteTemperature }) =>
              ({
                site: { id: site.id },
                date,
                satelliteTemperature,
              }) as DailyData,
          );
          return yearEntities.concat(yearEntitiesForSite);
        },
        [],
      );
      return entities.concat(allYearEntities);
    },
    [],
  );

  const sources = await Promise.all(
    selectedSites.map((site) => getNOAASource(site, sourcesRepository)),
  );

  const siteToSource: Record<number, Sources> = keyBy(
    sources,
    (source) => source.site.id,
  );

  await Bluebird.map(dailyDataEntities, async (entity) => {
    try {
      await dailyDataRepository.save(entity);
    } catch (err) {
      if (err.constraint === 'no_duplicated_date') {
        console.debug(
          `Data already exists for this date ${entity.date.toDateString()}`,
        );
      } else {
        console.error(err);
      }
    }

    if (!entity.satelliteTemperature) {
      return;
    }

    await insertSiteDataToTimeSeries(
      [
        {
          value: entity.satelliteTemperature,
          timestamp: entity.date.toISOString(),
        },
      ],
      Metric.SATELLITE_TEMPERATURE,
      siteToSource[entity.site.id],
      timeSeriesRepository,
    );
  });

  // Update materialized view
  refreshMaterializedView(siteRepository);

  connection.destroy();
  process.exit(0);
}

main();
