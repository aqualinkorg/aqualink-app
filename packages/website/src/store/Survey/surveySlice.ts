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
    setSurveyData: (state, action: PayloadAction<SurveyState>) => ({
      ...state,
      diveDateTime: action.payload.diveDateTime,
      comments: action.payload.comments,
      weatherConditions: action.payload.weatherConditions,
    }),
  },
});

export const diveLocationSelector = (
  state: RootState
): SurveyState["diveLocation"] => state.survey.diveLocation;

export const { setDiveLocation, setSurveyData } = surveySlice.actions;

export default surveySlice.reducer;
