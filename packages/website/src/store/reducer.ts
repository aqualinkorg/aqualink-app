import { combineReducers } from "redux";

import selectedReef from "./Reefs/slice";

const appReducer = combineReducers({
  selectedReef,
});

export default appReducer;
