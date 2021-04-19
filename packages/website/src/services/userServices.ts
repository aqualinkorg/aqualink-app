import app from "../firebase";
import requests from "../helpers/requests";

import {
  CollectionDetails,
  CollectionSummary,
  User,
} from "../store/User/types";
import type { Reef } from "../store/Reefs/types";

const createUser = (email: string, password: string) =>
  app && app.auth().createUserWithEmailAndPassword(email, password);

const storeUser = (
  fullName: string,
  email: string,
  organization: string,
  token?: string
) =>
  requests.send<User>({
    method: "POST",
    url: "users",
    data: {
      fullName,
      email,
      organization,
    },
    token,
  });

const resetPassword = (email: string) => {
  if (app) {
    app.auth().sendPasswordResetEmail(email, { url: "https://aqualink.org" });
  }
};

const getSelf = (token?: string) =>
  requests.send<User>({
    method: "GET",
    url: "users/current",
    token,
  });

const getAdministeredReefs = (token?: string) =>
  requests.send<Reef[]>({
    method: "GET",
    url: "users/current/administered-reefs",
    token,
  });

const getCollections = (token?: string) =>
  requests.send<CollectionSummary[]>({
    method: "GET",
    url: "collections",
    token,
  });

const getCollection = (id: number, token?: string) =>
  requests.send<CollectionDetails>({
    method: "GET",
    url: `collections/${id}`,
    token,
  });

const signInUser = (email: string, password: string) =>
  app && app.auth().signInWithEmailAndPassword(email, password);

const signOutUser = () => app && app.auth().signOut();

export default {
  createUser,
  storeUser,
  getAdministeredReefs,
  getCollections,
  getCollection,
  getSelf,
  resetPassword,
  signInUser,
  signOutUser,
};
