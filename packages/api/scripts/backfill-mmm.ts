import yargs from 'yargs/yargs';
import pLimit from 'p-limit';
import { In, IsNull } from 'typeorm';
import { Point } from 'geojson';
import { Site } from '../src/sites/sites.entity';
import { HistoricalMonthlyMean } from '../src/sites/historical-monthly-mean.entity';
import { getMMM, getHistoricalMonthlyMeans } from '../src/utils/temperature';
import AqualinkDataSource from '../ormconfig';

const argv = yargs(process.argv.slice(2))
  .options({
    siteIds: {
      alias: 's',
      type: 'array',
      describe:
        'Specific site IDs to repair (defaults to every site missing max_monthly_mean)',
    },
  })
  .parseSync();

async function main() {
  const dataSource = await AqualinkDataSource.initialize();
  const siteRepository = dataSource.getRepository(Site);
  const historicalMonthlyMeanRepository = dataSource.getRepository(
    HistoricalMonthlyMean,
  );

  const requestedIds = argv.siteIds?.map((id) => Number(id));

  const sites = await siteRepository.find({
    where: requestedIds?.length
      ? { id: In(requestedIds) }
      : { maxMonthlyMean: IsNull() },
    relations: ['historicalMonthlyMean'],
  });

  console.log(`Found ${sites.length} site(s) to repair.`);

  const limit = pLimit(10);
  const outcomes = await Promise.all(
    sites.map((site) =>
      limit(async () => {
        const [longitude, latitude] = (site.polygon as Point).coordinates;

        const maxMonthlyMean = await getMMM(longitude, latitude);
        const historicalMonthlyMeans = await getHistoricalMonthlyMeans(
          longitude,
          latitude,
        );

        if (!site.maxMonthlyMean && maxMonthlyMean) {
          await siteRepository.update(site.id, { maxMonthlyMean });
        }

        const existingMonths = new Set(
          (site.historicalMonthlyMean || []).map((m) => m.month),
        );
        const missingMonths = historicalMonthlyMeans.filter(
          ({ month, temperature }) => temperature && !existingMonths.has(month),
        );

        await Promise.all(
          missingMonths.map(({ month, temperature }) =>
            historicalMonthlyMeanRepository.insert({
              site,
              month,
              temperature,
            }),
          ),
        );

        const stillMissingMax = !site.maxMonthlyMean && !maxMonthlyMean;
        const stillMissingMonths =
          12 - (existingMonths.size + missingMonths.length);

        if (stillMissingMax || stillMissingMonths > 0) {
          console.warn(
            `Site ${site.id} (${site.name}) still incomplete: ` +
              `maxMonthlyMean=${maxMonthlyMean ?? 'still null'}, ` +
              `missing ${stillMissingMonths} month(s).`,
          );
        } else {
          console.log(`Site ${site.id} (${site.name}) repaired.`);
        }

        return {
          siteId: site.id,
          repaired: !stillMissingMax && stillMissingMonths === 0,
        };
      }),
    ),
  );

  const repairedCount = outcomes.filter((o) => o.repaired).length;
  console.log(`Repaired ${repairedCount} of ${sites.length} sites.`);

  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line fp/no-mutation
  process.exitCode = 1;
});
