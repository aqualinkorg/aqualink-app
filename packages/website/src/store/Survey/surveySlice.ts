import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  combineReducers,
} from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import { SelectedSurveyState, SurveyState, SurveyData } from "./types";
import type { RootState, CreateAsyncThunkTypes } from "../configure";
import surveyServices from "../../services/surveyServices";

const selectedSurveyInitialState: SelectedSurveyState = {
  loading: false,
  error: null,
};

const surveyInitialState: SurveyState = {
  diveLocation: null,
};

export const surveyGetRequest = createAsyncThunk<
  SelectedSurveyState["details"],
  string,
  CreateAsyncThunkTypes
>(
  "selectedSurvey/getRequest",
  async (surveyId: string, { rejectWithValue }) => {
    try {
      const { data } = await surveyServices.getSurvey(surveyId);
      return data;
    } catch (err) {
      const error: AxiosError<SelectedSurveyState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

interface userAttributes {
  surveyData: SurveyData;
  changeTab: (index: number) => void;
}

export const surveyAddRequest = createAsyncThunk<
  SelectedSurveyState["details"],
  userAttributes,
  CreateAsyncThunkTypes
>(
  "selectedSurvey/addRequest",
  async ({ surveyData, changeTab }, { rejectWithValue }) => {
    try {
      const { data } = await surveyServices
        .addSurvey(surveyData)
        .then((res) => {
          changeTab(1);
          return res;
        });
      return data;
    } catch (err) {
      const error: AxiosError<SelectedSurveyState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

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

const selectedSurveySlice = createSlice({
  name: "selectedSurvey",
  initialState: selectedSurveyInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      surveyGetRequest.fulfilled,
      (state, action: PayloadAction<SelectedSurveyState["details"]>) => {
        return {
          ...state,
          details: action.payload,
          loading: false,
        };
      }
    );
    builder.addCase(
      surveyGetRequest.rejected,
      (state, action: PayloadAction<SelectedSurveyState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      }
    );
    builder.addCase(surveyGetRequest.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });
    builder.addCase(
      surveyAddRequest.fulfilled,
      (state, action: PayloadAction<SelectedSurveyState["details"]>) => {
        return {
          ...state,
          details: action.payload,
          loading: false,
        };
      }
    );
    builder.addCase(
      surveyAddRequest.rejected,
      (state, action: PayloadAction<SelectedSurveyState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      }
    );
    builder.addCase(surveyAddRequest.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });
  },
});

const surveyReducer = combineReducers({
  survey: surveySlice.reducer,
  selectedSurvey: selectedSurveySlice.reducer,
});

export const diveLocationSelector = (
  state: RootState
): SurveyState["diveLocation"] => state.surveyReducer.survey.diveLocation;

/* For surveyRequest */
export const surveyDetailsSelector = (
  state: RootState
): SelectedSurveyState["details"] => state.surveyReducer.selectedSurvey.details;

export const surveyLoadingSelector = (
  state: RootState
): SelectedSurveyState["loading"] => state.surveyReducer.selectedSurvey.loading;

export const surveyErrorSelector = (
  state: RootState
): SelectedSurveyState["error"] => state.surveyReducer.selectedSurvey.error;

export const { setDiveLocation } = surveySlice.actions;

export default surveyReducer;
