import { ServiceAccount } from 'firebase-admin';

try {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  require('dotenv').config();
} catch {
  // Pass
}

export const serviceAccount = {
  project_id: process.env.FB_PROJECT_ID,
  private_key: process.env.FB_PRIVATE_KEY,
  client_email: process.env.FB_CLIENT_EMAIL,
} as ServiceAccount;
