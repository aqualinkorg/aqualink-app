import * as firebase from "firebase/app";
import "firebase/auth";

const { REACT_APP_FIREBASE_API_KEY: apiKey } = process.env;

const app = apiKey
  ? firebase.initializeApp({
      apiKey,
    })
  : undefined;

export default app;
