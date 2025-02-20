import { initializeApp } from 'firebase/app';

const { VITEFIREBASE_API_KEY: apiKey } = import.meta.env;

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
