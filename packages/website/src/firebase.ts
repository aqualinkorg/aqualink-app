import { initializeApp } from 'firebase/app';

const { REACT_APP_FIREBASE_API_KEY: apiKey } = process.env;

if (!apiKey) {
  console.warn(
    'No Firebase API Key provided. Please set up Firebase to use login and admin functionalities.',
  );
}

const app = apiKey
  ? initializeApp({
      apiKey,
    })
  : undefined;

export default app;
