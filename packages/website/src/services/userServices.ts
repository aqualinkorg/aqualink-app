import { User } from 'store/User/types';
import type { Site } from 'store/Sites/types';
import requests from 'helpers/requests';
import {
  createUserWithEmailAndPassword,
  getAuth,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import app from '../firebase';

const createUser = (email: string, password: string) => {
  if (app) {
    const auth = getAuth(app);
    return createUserWithEmailAndPassword(auth, email, password);
  }
  return undefined;
};

const storeUser = (
  fullName: string,
  email: string,
  organization: string,
  token?: string,
) =>
  requests.send<User>({
    method: 'POST',
    url: 'users',
    data: {
      fullName,
      email,
      organization,
    },
    token,
  });

const resetPassword = (email: string): Promise<void> => {
  if (!app) Promise.resolve();
  const auth = getAuth(app);
  return sendPasswordResetEmail(auth, email, { url: window.location.origin });
};

const getSelf = (token?: string) =>
  requests.send<User>({
    method: 'GET',
    url: 'users/current',
    token,
  });

const getAdministeredSites = (token?: string) =>
  requests.send<Site[]>({
    method: 'GET',
    url: 'users/current/administered-sites',
    token,
  });

const signInUser = (email: string, password: string) => {
  if (app) {
    const auth = getAuth(app);
    return signInWithEmailAndPassword(auth, email, password);
  }
  return undefined;
};

const signOutUser = () => {
  if (app) {
    const auth = getAuth(app);
    return signOut(auth);
  }
  return undefined;
};

export default {
  createUser,
  storeUser,
  getAdministeredSites,
  getSelf,
  resetPassword,
  signInUser,
  signOutUser,
};
