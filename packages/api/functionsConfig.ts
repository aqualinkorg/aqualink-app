import { existsSync } from 'fs';
import { resolve } from 'path';

const envPath = process.env.DOTENV_CONFIG_PATH;
if (!envPath) {
  // eslint-disable-next-line no-console
  console.error(
    'DOTENV_CONFIG_PATH is required. Use one of:\n' +
      '  yarn config:cloud-functions:prod\n' +
      '  yarn config:cloud-functions:staging\n' +
      '  yarn config:cloud-functions:programize',
  );
  process.exit(1);
}

const resolvedEnvPath = resolve(process.cwd(), envPath);
if (!existsSync(resolvedEnvPath)) {
  // eslint-disable-next-line no-console
  console.error(`Env file not found: ${resolvedEnvPath}`);
  process.exit(1);
}

try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config({ path: resolvedEnvPath, quiet: true });
} catch {
  // Pass
}

// stderr so it is not captured by $(ts-node …) into firebase args
// eslint-disable-next-line no-console
console.error(`Loading Firebase functions config from ${resolvedEnvPath}`);

export const functionsConfig = {
  slack: {
    token: process.env.SLACK_BOT_TOKEN,
    channel: process.env.SLACK_BOT_CHANNEL,
  },
  sofar_api: {
    token: process.env.SOFAR_API_TOKEN,
  },
  open_meteo: {
    api_key: process.env.OPEN_METEO_API_KEY,
    // Explicit enable; unset/false pauses fetch (use true on prod only).
    enabled: process.env.OPEN_METEO_ENABLED,
  },
  front: {
    base_url: process.env.FRONT_END_BASE_URL,
  },
  api: {
    base_url: process.env.BACKEND_BASE_URL,
  },
  google: {
    api_key: process.env.FIREBASE_API_KEY,
  },
  database: {
    url: process.env.DATABASE_URL,
  },
};

const requiredKeys: Array<[string, string | undefined]> = [
  ['DATABASE_URL', process.env.DATABASE_URL],
  ['SOFAR_API_TOKEN', process.env.SOFAR_API_TOKEN],
  ['BACKEND_BASE_URL', process.env.BACKEND_BASE_URL],
];

const missing = requiredKeys
  .filter(([, value]) => !value || value === 'undefined')
  .map(([key]) => key);

if (missing.length > 0) {
  // eslint-disable-next-line no-console
  console.error(
    `Missing required env vars in ${resolvedEnvPath}: ${missing.join(', ')}`,
  );
  process.exit(1);
}

const databaseHost = process.env.DATABASE_URL!.split('@')[1] ?? '(unknown)';
// eslint-disable-next-line no-console
console.error(`database.url host → ${databaseHost}`);

const stringifiedConfigsBySection = Object.entries(functionsConfig)
  .map(([service, keys]) =>
    Object.entries(keys)
      .filter(([, value]) => value !== undefined && value !== 'undefined')
      .map(([key, value]) => `${service}.${key}=${value}`)
      .join(' '),
  )
  .filter(Boolean)
  .join(' ');

if (!stringifiedConfigsBySection) {
  // eslint-disable-next-line no-console
  console.error('No config values to set.');
  process.exit(1);
}

// eslint-disable-next-line no-console
console.log(stringifiedConfigsBySection);
