// dotenv is a dev dependency, so conditionally import it (don't need it in Prod).
try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
} catch {
  // Pass
}

export const STORM_GLASS_API_KEY = process.env.STORMGLASS_API_KEY;
export const STORM_GLASS_BASE_URL = 'https://api.stormglass.io/v2/';
