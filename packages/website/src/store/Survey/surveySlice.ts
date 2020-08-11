import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import { SurveyState } from "./types";
import type { RootState } from "../configure";

const surveyInitialState: SurveyState = {
  diveLocation: null,
};

const surveySlice = createSlice({
  name: "survey",
  initialState: surveyInitialState,
  reducers: {
    setDiveLocation: (
      state,
      action: PayloadAction<SurveyState["diveLocation"]>
    ) => ({
      ...state,
      diveLocation: action.payload,
    }),
  },
});

export const diveLocationSelector = (
  state: RootState
): SurveyState["diveLocation"] => state.survey.diveLocation;

export const { setDiveLocation } = surveySlice.actions;

export default surveySlice.reducer;
