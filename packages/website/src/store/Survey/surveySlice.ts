import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  combineReducers,
} from "@reduxjs/toolkit";
import {
  SelectedSurveyState,
  SurveyState,
  SurveyData,
  SurveyMediaUpdateRequestData,
  SurveyMedia,
} from "./types";
import type { RootState, CreateAsyncThunkTypes } from "../configure";
import surveyServices from "../../services/surveyServices";
import { getAxiosErrorMessage } from "../../helpers/errors";

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
      return rejectWithValue(getAxiosErrorMessage(err));
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
      const { data } = await surveyServices.addSurvey(siteId, surveyData);
      changeTab(1);
      return data;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  }
);

interface SurveyEditRequestData {
  siteId: number;
  mediaId: number;
  data: Partial<SurveyMediaUpdateRequestData>;
  token: string;
}

export const surveyEditRequest = createAsyncThunk<
  SurveyMedia,
  SurveyEditRequestData,
  CreateAsyncThunkTypes
>(
  "selectedSurvey/editRequest",
  async ({ siteId, mediaId, data, token }, { rejectWithValue }) => {
    try {
      const response = await surveyServices.editSurveyMedia(
        siteId,
        mediaId,
        data,
        token
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
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

    builder.addCase(
      surveyEditRequest.fulfilled,
      (state, action: PayloadAction<SurveyMedia>) => {
        const oldMedia = state.details?.surveyMedia;
        const newMedia = oldMedia
          ? oldMedia.map((x) => {
              if (x.id === action.payload.id) {
                return action.payload;
              }
              return x;
            })
          : oldMedia;
        const newDetails = state.details
          ? { ...state.details, surveyMedia: newMedia }
          : state.details;
        return {
          ...state,
          details: newDetails,
          loading: false,
        };
      }
    );
    builder.addCase(
      surveyEditRequest.rejected,
      (state, action: PayloadAction<SelectedSurveyState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      }
    );
    builder.addCase(surveyEditRequest.pending, (state) => {
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
