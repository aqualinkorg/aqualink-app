import { DataSource } from 'typeorm';
import { Logger } from '@nestjs/common';
import { Metric } from '../src/time-series/metrics.enum';
import { getSpotterData } from '../src/utils/sofar';
import {
  extractSeapHoxFromSofarData,
  SeapHOxData,
} from '../src/utils/seaphox-decoder';
import { ValueWithTimestamp } from '../src/utils/sofar.types';

const logger = new Logger('SeapHOxMonthlyBackfill');
const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

async function backfillSeapHOxMonthly(
  dataSource: DataSource,
  siteId: number,
  startDateStr: string,
) {
  const siteResult = await dataSource.query(
    'SELECT id, sensor_id, spotter_api_token FROM site WHERE id = $1',
    [siteId],
  );

  if (!siteResult || siteResult.length === 0 || !siteResult[0].sensor_id) {
    throw new Error(`Site ${siteId} not found or missing sensor_id`);
  }

  const site = {
    id: siteResult[0].id,
    sensorId: siteResult[0].sensor_id,
    spotterApiToken: siteResult[0].spotter_api_token,
  };

  const sourceResult = await dataSource.query(
    "SELECT id FROM sources WHERE type = 'seaphox' AND site_id = $1",
    [siteId],
  );

  if (!sourceResult || sourceResult.length === 0) {
    throw new Error(`No SeapHOx source found for site ${siteId}`);
  }

  const seaphoxSource = { id: sourceResult[0].id };

  const token = site.spotterApiToken || process.env.SOFAR_API_TOKEN;

  if (!token) {
    throw new Error(
      'No Sofar API token configured. Set site.spotter_api_token or SOFAR_API_TOKEN before running the SeapHOx monthly backfill.',
    );
  }

  const startDate = new Date(startDateStr);
  const now = new Date();
  // eslint-disable-next-line fp/no-mutation
  let currentMonth = new Date(startDate.getFullYear(), startDate.getMonth(), 1);

  while (currentMonth <= now) {
    const monthStart = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      1,
    );
    const monthEnd = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      0,
      23,
      59,
      59,
    );
    const fetchEnd = monthEnd > now ? now : monthEnd;
    const monthName = monthStart.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    logger.log(`Fetching ${monthName}...`);

    try {
      // eslint-disable-next-line no-await-in-loop
      const spotterData = await getSpotterData(
        site.sensorId,
        token,
        fetchEnd,
        monthStart,
        true,
      );
      const seaphoxData = extractSeapHoxFromSofarData(spotterData.raw || []);

      if (seaphoxData.length > 0) {
        logger.log(`Found ${seaphoxData.length} SeapHOx readings`);

        const metrics: Array<[keyof SeapHOxData, Metric]> = [
          ['temperature', Metric.BOTTOM_TEMPERATURE],
          ['externalPh', Metric.PH],
          ['internalPh', Metric.INTERNAL_PH],
          ['externalPhVolt', Metric.EXTERNAL_PH_VOLT],
          ['internalPhVolt', Metric.INTERNAL_PH_VOLT],
          ['phTemperature', Metric.PH_TEMPERATURE],
          ['pressure', Metric.PRESSURE],
          ['salinity', Metric.SALINITY],
          ['conductivity', Metric.CONDUCTIVITY],
          ['oxygen', Metric.DISSOLVED_OXYGEN],
          ['relativeHumidity', Metric.RELATIVE_HUMIDITY],
          ['intTemperature', Metric.INTERNAL_TEMPERATURE],
        ];

        // eslint-disable-next-line no-restricted-syntax
        for (const [field, metric] of metrics) {
          const values: ValueWithTimestamp[] = seaphoxData
            .filter(
              (d) => typeof d[field] === 'number' && !Number.isNaN(d[field]),
            )
            .map((d) => ({
              value: d[field] as number,
              timestamp: d.timestamp,
            }));

          if (values.length > 0) {
            const chunkSize = 500;
            // eslint-disable-next-line no-restricted-syntax, fp/no-mutation
            for (let start = 0; start < values.length; start += chunkSize) {
              const chunk = values.slice(start, start + chunkSize);
              // eslint-disable-next-line fp/no-mutation
              const params: any[] = [];
              const valuesPlaceholders = chunk
                .map((v, index) => {
                  const baseIndex = index * 4;
                  // eslint-disable-next-line fp/no-mutating-methods
                  params.push(
                    metric,
                    v.value,
                    new Date(v.timestamp).toISOString(),
                    seaphoxSource.id,
                  );
                  return `($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3}, $${baseIndex + 4})`;
                })
                .join(',');

              // eslint-disable-next-line no-await-in-loop
              await dataSource.query(
                `
                INSERT INTO time_series (metric, value, timestamp, source_id)
                VALUES ${valuesPlaceholders}
                ON CONFLICT ON CONSTRAINT no_duplicate_data DO NOTHING
              `,
                params,
              );
            }
          }
        }

        logger.log(`✓ Saved ${monthName}`);
      }

      // eslint-disable-next-line no-await-in-loop
      await sleep(5000);
    } catch (error: any) {
      logger.error(`✗ Error with ${monthName}: ${error.message}`);
    }

    // eslint-disable-next-line fp/no-mutation
    currentMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );
  }

  logger.log('Backfill complete!');
}

async function main() {
  // Usage: yarn backfill:seaphox <siteId> <startDate>
  // Example: yarn backfill:seaphox 1006 2025-08-21
  const siteIdArg = process.argv[2] ?? process.env.SEAPHOX_SITE_ID;
  const startDateArg = process.argv[3] ?? process.env.SEAPHOX_START_DATE;

  if (!siteIdArg || !startDateArg) {
    console.error(
      'Missing required parameters for SeapHOx backfill. ' +
        'Provide <siteId> and <startDate> as CLI arguments or set ' +
        'SEAPHOX_SITE_ID and SEAPHOX_START_DATE env vars. ' +
        'Example: yarn backfill:seaphox 1006 2025-08-21',
    );
    // eslint-disable-next-line fp/no-mutation
    process.exitCode = 1;
    return;
  }

  const siteId = Number(siteIdArg);

  if (!Number.isInteger(siteId) || siteId <= 0) {
    console.error(
      `Invalid siteId "${siteIdArg}". siteId must be a positive integer.`,
    );
    // eslint-disable-next-line fp/no-mutation
    process.exitCode = 1;
    return;
  }

  if (Number.isNaN(new Date(startDateArg).getTime())) {
    console.error(
      `Invalid startDate "${startDateArg}". Expected a valid date string, e.g. "2025-08-21".`,
    );
    // eslint-disable-next-line fp/no-mutation
    process.exitCode = 1;
    return;
  }

  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: parseInt(process.env.POSTGRES_PORT || '5432', 10),
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    entities: ['src/**/*.entity.ts'],
    synchronize: false,
  });

  await dataSource.initialize();
  await backfillSeapHOxMonthly(dataSource, siteId, startDateArg);
  await dataSource.destroy();
}

main().catch((error) => {
  console.error(error);
  // eslint-disable-next-line fp/no-mutation
  process.exitCode = 1;
});
