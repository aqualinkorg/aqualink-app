import { initializeApp } from 'firebase/app';

const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

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
