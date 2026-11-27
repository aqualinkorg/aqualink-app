/* eslint-disable fp/no-mutation */
// 2nd gen Cloud Functions. Environment variables are injected at startup from
// the `.env.<projectId>` file written by `yarn config:cloud-functions:<project>`.
// `functions.config()` is 1st gen only and is not available here.
import Axios from 'axios';
import { setGlobalOptions } from 'firebase-functions/v2';
import { onRequest } from 'firebase-functions/v2/https';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { DataSource } from 'typeorm';
import { runDailyUpdate } from '../src/workers/dailyData';
import {
  runSpotterTimeSeriesUpdate,
  runWaveTimeSeriesUpdate,
  runWindTimeSeriesUpdate,
} from '../src/workers/spotterTimeSeries';
import { runSSTTimeSeriesUpdate } from '../src/workers/sstTimeSeries';
import { checkVideoStreams } from '../src/workers/check-video-streams';
import { sendSlackMessage } from '../src/utils/slack.utils';
import { checkBuoysStatus } from '../src/workers/check-buoys-status';
import { NOAALocationUpdate } from '../src/workers/noaa-location-update';
import { dataSourceOptions } from '../ormconfig';

// We have to manually import all required entities here, unfortunately - the globbing that is used in ormconfig.ts
// doesn't work with Webpack. This declaration gets processed by a custom loader (`add-entities.js`) to add import
// statements for all the entity classes.
// import-all-entities

/**
 * Crude check to try to get the entity itself from the full module import. Checks if the export name begins with an
 * uppercase letter and the export itself is a function. There might be a more accurate way to do this?
 * @param fullImport
 */
function extractEntityDefinition(fullImport: Record<string, any>) {
  const exportKey =
    Object.keys(fullImport).find(
      (key) =>
        key[0].toUpperCase() === key[0] &&
        typeof fullImport[key] === 'function',
    ) || Object.keys(fullImport)[0];
  return fullImport[exportKey];
}

function addTrailingSlashToUrl(url: string) {
  return url.endsWith('/') ? url : `${url}/`;
}

function hasProjectId(config: any): config is { projectId: string } {
  return config && 'projectId' in config;
}

// Match 1st gen: one request per instance, same CPU sizing. 2nd gen otherwise
// defaults to 80 concurrent requests per instance, and each request opens a
// TypeORM connection.
setGlobalOptions({
  region: 'us-central1',
  concurrency: 1,
  cpu: 'gcf_gen1',
});

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable ${name}`);
  }
  return value;
}

async function sendErrorToSlack(method: string, err: any) {
  const token = process.env.SLACK_BOT_TOKEN;
  const channel = process.env.SLACK_BOT_CHANNEL;

  if (!token || !channel) {
    console.error(
      'Missing slack token or channel. Cannot log error to slack...',
    );
    return;
  }

  const payload = {
    channel,
    text: `A firebase error has occurred on firebase function ${method}:\n${err}`,
    mrkdwn: true,
  };

  await sendSlackMessage(payload, token);
}

// Remove all the connection info from the dbConfig object - we want to replace it with the dbUrl input from this
// function argument.
const {
  url,
  host,
  port,
  database,
  username,
  password,
  entities: defaultEntities,
  ...dbConfig
} = dataSourceOptions as any;

async function runWithDataSource(
  functionName: string,
  callback: (conn: DataSource) => void | Promise<void>,
) {
  const dbUrl = requireEnv('DATABASE_URL');
  // eslint-disable-next-line no-undef
  const entities = dbEntities.map(extractEntityDefinition);
  const dataSource = new DataSource({
    ...dbConfig,
    url: dbUrl,
    entities,
  });
  const connection = await dataSource.initialize();
  try {
    await callback(connection);
  } catch (err) {
    await sendErrorToSlack(functionName, err);
    throw err;
  } finally {
    dataSource.destroy();
  }
}

const longRunning = {
  timeoutSeconds: 540,
  memory: '512MiB' as const,
};

// Start a daily update for each sites.
// Public invoker matches 1st gen HTTPS, which allowed unauthenticated calls.
exports.dailyUpdate = onRequest(
  {
    ...longRunning,
    memory: '256MiB',
    invoker: 'public',
  },
  async (req, res) => {
    requireEnv('SOFAR_API_TOKEN');

    await runWithDataSource('dailyUpdate', async (conn: DataSource) => {
      await runDailyUpdate(conn);
      res.json({ result: `Daily update on ${new Date()}` });
    });
  },
);

exports.scheduledDailyUpdate = onSchedule(
  {
    ...longRunning,
    schedule: '0 4 * * *',
    timeZone: 'America/Los_Angeles',
    retryCount: 2,
  },
  async () => {
    requireEnv('SOFAR_API_TOKEN');

    await runWithDataSource(
      'scheduledDailyUpdate',
      async (conn: DataSource) => {
        await runDailyUpdate(conn);
        console.log(`Daily update on ${new Date()}`);
      },
    );
  },
);

exports.pingService = onSchedule(
  {
    schedule: '*/5 * * * *',
  },
  async () => {
    const backendBaseUrl = requireEnv('BACKEND_BASE_URL');
    console.log('Pinging server');
    try {
      await Axios.get(
        new URL('health-check', addTrailingSlashToUrl(backendBaseUrl)).href,
      );
    } catch (err) {
      await sendErrorToSlack('pingService', err);
      throw err;
    }
  },
);

exports.scheduledSpotterTimeSeriesUpdate = onSchedule(
  {
    ...longRunning,
    // Run spotter data update every hour
    schedule: '0 * * * *',
    timeZone: 'America/Los_Angeles',
    retryCount: 2,
  },
  async () => {
    requireEnv('SOFAR_API_TOKEN');
    // Spotter data will not be saved in time-series,
    // if the spotter is too far from it's site.
    // This check is skipped for staging and test environments.
    const skipDistanceCheck = requireEnv('BACKEND_BASE_URL').includes(
      'ocean-systems',
    );

    await runWithDataSource(
      'scheduledSpotterTimeSeriesUpdate',
      async (conn: DataSource) => {
        await runSpotterTimeSeriesUpdate(conn, skipDistanceCheck);
        console.log(`Spotter data hourly update on ${new Date()}`);
      },
    );
  },
);

// Wave (Open-Meteo) and wind (Sofar GFS) run as separate scheduled
// functions so each stays under the 540s Cloud Function timeout. The
// previous combined job timed out mid Sofar-wind loop and left ~30% of
// sites without a fresh open_meteo row. Wind is staggered +10 min.
exports.scheduledWaveTimeSeriesUpdate = onSchedule(
  {
    ...longRunning,
    // Open-Meteo Marine updates every 6 hours (00/06/12/18 UTC). Schedule
    // ~4x/day, timed after each model cycle typically finishes publishing.
    schedule: '20 4,10,16,22 * * *',
    timeZone: 'America/Los_Angeles',
    retryCount: 2,
  },
  async () => {
    await runWithDataSource(
      'scheduledWaveTimeSeriesUpdate',
      async (conn: DataSource) => {
        await runWaveTimeSeriesUpdate(conn);
        console.log(`Wave data update on ${new Date()}`);
      },
    );
  },
);

exports.scheduledWindTimeSeriesUpdate = onSchedule(
  {
    ...longRunning,
    schedule: '30 4,10,16,22 * * *',
    timeZone: 'America/Los_Angeles',
    retryCount: 2,
  },
  async () => {
    requireEnv('SOFAR_API_TOKEN');

    await runWithDataSource(
      'scheduledWindTimeSeriesUpdate',
      async (conn: DataSource) => {
        await runWindTimeSeriesUpdate(conn);
        console.log(`Wind data update on ${new Date()}`);
      },
    );
  },
);

exports.scheduledSSTTimeSeriesUpdate = onSchedule(
  {
    ...longRunning,
    // Run sst data update every hour
    schedule: '0 * * * *',
    timeZone: 'America/Los_Angeles',
    retryCount: 2,
  },
  async () => {
    requireEnv('SOFAR_API_TOKEN');

    await runWithDataSource(
      'scheduledSSTTimeSeriesUpdate',
      async (conn: DataSource) => {
        await runSSTTimeSeriesUpdate(conn);
        console.log(`SST data hourly update on ${new Date()}`);
      },
    );
  },
);

exports.scheduledVideoStreamsCheck = onSchedule(
  {
    ...longRunning,
    // VideoStreamCheck will run daily at 12:00 AM
    schedule: '0 0 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    if (!process.env.FIREBASE_CONFIG) {
      console.error('Firebase config env variable has not be set');
      return;
    }

    const FIREBASE_CONFIG = JSON.parse(process.env.FIREBASE_CONFIG);
    if (!hasProjectId(FIREBASE_CONFIG)) {
      console.error(
        `Firebase config has not been set properly, ${process.env.FIREBASE_CONFIG}`,
      );
      return;
    }

    const { projectId } = FIREBASE_CONFIG;

    await runWithDataSource(
      'scheduledSSTTimeSeriesUpdate',
      async (conn: DataSource) => {
        await checkVideoStreams(conn, projectId);
        console.log(`Video stream daily check on ${new Date()} is complete.`);
      },
    );
  },
);

exports.scheduledBuoysStatusCheck = onSchedule(
  {
    ...longRunning,
    // BuoysStatusCheck will run daily at 12:00 AM
    schedule: '0 0 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    await runWithDataSource(
      'scheduledBuoysStatusCheck',
      async (conn: DataSource) => {
        await checkBuoysStatus(conn);
        console.log(`Buoys status daily check on ${new Date()} is complete.`);
      },
    );
  },
);

exports.scheduledNOAALocationUpdate = onSchedule(
  {
    ...longRunning,
    // NOAALocationUpdate will run daily at 1:00 AM
    schedule: '0 1 * * *',
    timeZone: 'America/Los_Angeles',
  },
  async () => {
    await runWithDataSource(
      'scheduledNOAALocationUpdate',
      async (conn: DataSource) => {
        await NOAALocationUpdate(conn);
        console.log(
          `NOAA location daily update check on ${new Date()} is complete.`,
        );
      },
    );
  },
);
