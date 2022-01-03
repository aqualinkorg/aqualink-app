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
  loading: true,
  error: null,
};

const surveyFormDraftInitialState: SurveyState = {
  diveLocation: null,
  surveyMedia: [],
};

interface GetSurveyParams {
  surveyId: string;
  siteId: string;
}

export const surveyGetRequest = createAsyncThunk<
  SelectedSurveyState["details"],
  GetSurveyParams,
  CreateAsyncThunkTypes
>(
  "selectedSurvey/getRequest",
  async ({ surveyId, siteId }, { rejectWithValue }) => {
    try {
      const { data } = await surveyServices.getSurvey(siteId, surveyId);
      return data;
    } catch (err) {
      const error: AxiosError<SelectedSurveyState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

interface UserAttributes {
  siteId: string;
  surveyData: SurveyData;
  changeTab: (index: number) => void;
}

export const surveyAddRequest = createAsyncThunk<
  SelectedSurveyState["details"],
  UserAttributes,
  CreateAsyncThunkTypes
>(
  "selectedSurvey/addRequest",
  async ({ surveyData, siteId, changeTab }, { rejectWithValue }) => {
    try {
      const { data } = await surveyServices
        .addSurvey(siteId, surveyData)
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

const surveyFormDraft = createSlice({
  name: "survey",
  initialState: surveyFormDraftInitialState,
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

const selectedSurvey = createSlice({
  name: "selectedSurvey",
  initialState: selectedSurveyInitialState,
  reducers: {
    clearSurvey: (state) => ({
      ...state,
      details: null,
    }),
    setSelectedPoi: (
      state,
      action: PayloadAction<SelectedSurveyState["selectedPoi"]>
    ) => ({
      ...state,
      selectedPoi: action.payload,
    }),
    setFeaturedImage: (state, action: PayloadAction<number>) => ({
      ...state,
      details: state.details
        ? {
            ...state.details,
            surveyMedia: state.details.surveyMedia
              ? state.details.surveyMedia.map((media) => ({
                  ...media,
                  featured: media.id === action.payload,
                }))
              : state.details.surveyMedia,
          }
        : state.details,
    }),
  },
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

const survey = combineReducers({
  surveyFormDraft: surveyFormDraft.reducer,
  selectedSurvey: selectedSurvey.reducer,
});

export const diveLocationSelector = (
  state: RootState
): SurveyState["diveLocation"] => state.survey.surveyFormDraft.diveLocation;

/* For surveyRequest */
export const surveyDetailsSelector = (
  state: RootState
): SelectedSurveyState["details"] => state.survey.selectedSurvey.details;

export const selectedSurveyPointSelector = (
  state: RootState
): SelectedSurveyState["selectedPoi"] =>
  state.survey.selectedSurvey.selectedPoi;

export const surveyLoadingSelector = (
  state: RootState
): SelectedSurveyState["loading"] => state.survey.selectedSurvey.loading;

export const surveyErrorSelector = (
  state: RootState
): SelectedSurveyState["error"] => state.survey.selectedSurvey.error;

export const { setDiveLocation } = surveyFormDraft.actions;
export const { setSelectedPoi, clearSurvey, setFeaturedImage } =
  selectedSurvey.actions;

export default survey;
