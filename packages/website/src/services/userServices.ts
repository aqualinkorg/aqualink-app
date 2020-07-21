import app from "../firebase";

const createUser = (email: string, password: string) =>
  app.auth().createUserWithEmailAndPassword(email, password);

const signInUser = (email: string, password: string) =>
  app.auth().signInWithEmailAndPassword(email, password);

const signOutUser = () => app.auth().signOut();

export default {
  createUser,
  signInUser,
  signOutUser,
};
