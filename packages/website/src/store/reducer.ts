/* eslint-disable import/no-cycle */
import { combineReducers } from "redux";
import selectedReef from "./Reefs/selectedReefSlice";
import reefsList from "./Reefs/reefsListSlice";
import homepage from "./Homepage/homepageSlice";

const appReducer = combineReducers({
  selectedReef,
  reefsList,
  homepage,
});

export default appReducer;
