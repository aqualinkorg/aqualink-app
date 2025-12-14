/* eslint-disable fp/no-mutation */
// We need to assign cloud env variable to node env variables
import Axios from 'axios';
import * as functions from 'firebase-functions/v1';
import { DataSource } from 'typeorm';
import { runDailyUpdate } from '../src/workers/dailyData';
import {
  runSpotterTimeSeriesUpdate,
  runWindWaveTimeSeriesUpdate,
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

async function sendErrorToSlack(method: string, err: any) {
  const { token, channel } = functions.config().slack;

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
  const dbUrl = functions.config().database.url;

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

// Start a daily update for each sites.
exports.dailyUpdate = functions
  .runWith({ timeoutSeconds: 540 })
  .https.onRequest(async (req, res) => {
    process.env.SOFAR_API_TOKEN = functions.config().sofar_api.token;

    await runWithDataSource('dailyUpdate', async (conn: DataSource) => {
      await runDailyUpdate(conn);
      res.json({ result: `Daily update on ${new Date()}` });
    });
  });

exports.scheduledDailyUpdate = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  .pubsub.schedule('0 4 * * *')
  .timeZone('America/Los_Angeles')
  .retryConfig({ retryCount: 2 })
  .onRun(async () => {
    process.env.SOFAR_API_TOKEN = functions.config().sofar_api.token;

    await runWithDataSource(
      'scheduledDailyUpdate',
      async (conn: DataSource) => {
        await runDailyUpdate(conn);
        console.log(`Daily update on ${new Date()}`);
      },
    );
  });

exports.pingService = functions.pubsub
  .schedule('*/5 * * * *')
  .onRun(async () => {
    const backendBaseUrl: string = functions.config().api.base_url;
    console.log('Pinging server');
    try {
      await Axios.get(
        new URL('health-check', addTrailingSlashToUrl(backendBaseUrl)).href,
      );
    } catch (err) {
      await sendErrorToSlack('pingService', err);
      throw err;
    }
  });

exports.scheduledSpotterTimeSeriesUpdate = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  // Run spotter data update every hour
  .pubsub.schedule('0 * * * *')
  .timeZone('America/Los_Angeles')
  .retryConfig({ retryCount: 2 })
  .onRun(async () => {
    process.env.SOFAR_API_TOKEN = functions.config().sofar_api.token;
    // Spotter data will not be saved in time-series,
    // if the spotter is too far from it's site.
    // This check is skipped for staging and test environments.
    const skipDistanceCheck = functions
      .config()
      .api.base_url.includes('ocean-systems');

    await runWithDataSource(
      'scheduledSpotterTimeSeriesUpdate',
      async (conn: DataSource) => {
        await runSpotterTimeSeriesUpdate(conn, skipDistanceCheck);
        console.log(`Spotter data hourly update on ${new Date()}`);
      },
    );
  });

exports.scheduledWindWaveTimeSeriesUpdate = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  // Run spotter data update every hour
  .pubsub.schedule('30 * * * *')
  .timeZone('America/Los_Angeles')
  .retryConfig({ retryCount: 2 })
  .onRun(async () => {
    process.env.SOFAR_API_TOKEN = functions.config().sofar_api.token;

    await runWithDataSource(
      'scheduledWindWaveTimeSeriesUpdate',
      async (conn: DataSource) => {
        await runWindWaveTimeSeriesUpdate(conn);
        console.log(`Wind and Wave data hourly update on ${new Date()}`);
      },
    );
  });

exports.scheduledSSTTimeSeriesUpdate = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  // Run sst data update every hour
  .pubsub.schedule('0 * * * *')
  .timeZone('America/Los_Angeles')
  .retryConfig({ retryCount: 2 })
  .onRun(async () => {
    process.env.SOFAR_API_TOKEN = functions.config().sofar_api.token;

    await runWithDataSource(
      'scheduledSSTTimeSeriesUpdate',
      async (conn: DataSource) => {
        await runSSTTimeSeriesUpdate(conn);
        console.log(`SST data hourly update on ${new Date()}`);
      },
    );
  });

exports.scheduledVideoStreamsCheck = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  // VideoStreamCheck will run daily at 12:00 AM
  .pubsub.schedule('0 0 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    process.env.FIREBASE_API_KEY = functions.config().google.api_key;
    process.env.SLACK_BOT_TOKEN = functions.config().slack.token;
    process.env.SLACK_BOT_CHANNEL = functions.config().slack.channel;
    process.env.FRONT_END_BASE_URL = functions.config().front.base_url;

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
  });

exports.scheduledBuoysStatusCheck = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  // BuoysStatusCheck will run daily at 12:00 AM
  .pubsub.schedule('0 0 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    process.env.SLACK_BOT_TOKEN = functions.config().slack.token;
    process.env.SLACK_BOT_CHANNEL = functions.config().slack.channel;

    await runWithDataSource(
      'scheduledBuoysStatusCheck',
      async (conn: DataSource) => {
        await checkBuoysStatus(conn);
        console.log(`Buoys status daily check on ${new Date()} is complete.`);
      },
    );
  });

exports.scheduledNOAALocationUpdate = functions
  .runWith({ timeoutSeconds: 540, memory: '512MB' })
  // NOAALocationUpdate will run daily at 1:00 AM
  .pubsub.schedule('0 1 * * *')
  .timeZone('America/Los_Angeles')
  .onRun(async () => {
    await runWithDataSource(
      'scheduledNOAALocationUpdate',
      async (conn: DataSource) => {
        await NOAALocationUpdate(conn);
        console.log(
          `NOAA location daily update check on ${new Date()} is complete.`,
        );
      },
    );
  });
