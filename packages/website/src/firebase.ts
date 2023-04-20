import * as firebase from 'firebase/app';
import 'firebase/auth';

const { REACT_APP_FIREBASE_API_KEY: apiKey } = process.env;

if (!apiKey) {
  console.warn(
    'No Firebase API Key provided. Please set up Firebase to use login and admin functionalities.',
  );
}

const app = apiKey
  ? firebase.initializeApp({
      apiKey,
    })
  : undefined;

export default app;
