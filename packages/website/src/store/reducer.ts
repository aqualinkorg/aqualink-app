import { combineReducers } from "redux";

/* eslint-disable-next-line import/no-cycle */
import selectedReef from "./Reefs/slice";

const appReducer = combineReducers({
  selectedReef,
});

export default appReducer;
