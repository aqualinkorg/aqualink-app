/* eslint-disable import/no-cycle */
import { combineReducers } from "redux";
import selectedReef from "./Reefs/selectedReefSlicelice";
import reefsList from "./Reefs/reefsListSlice";

const appReducer = combineReducers({
  selectedReef,
  reefsList,
});

export default appReducer;
