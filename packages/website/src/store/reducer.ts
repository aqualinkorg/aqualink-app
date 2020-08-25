/* eslint-disable import/no-cycle */
import { combineReducers } from "redux";
import selectedReef from "./Reefs/selectedReefSlice";
import reefsList from "./Reefs/reefsListSlice";
import homepage from "./Homepage/homepageSlice";
import user from "./User/userSlice";
import surveyReducer from "./Survey/surveySlice";

const appReducer = combineReducers({
  selectedReef,
  reefsList,
  homepage,
  user,
  surveyReducer,
});

export default appReducer;
