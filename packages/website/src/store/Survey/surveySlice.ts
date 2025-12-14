import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  combineReducers,
} from '@reduxjs/toolkit';
import { getAxiosErrorMessage } from 'helpers/errors';
import surveyServices from 'services/surveyServices';
import {
  SelectedSurveyState,
  SurveyState,
  SurveyData,
  SurveyMediaUpdateRequestData,
  SurveyMedia,
} from './types';
import type { RootState, CreateAsyncThunkTypes } from '../configure';

const selectedSurveyInitialState: SelectedSurveyState = {
  loading: true,
  loadingSurveyMediaEdit: false,
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
  SelectedSurveyState['details'],
  GetSurveyParams,
  CreateAsyncThunkTypes
>(
  'selectedSurvey/getRequest',
  async ({ surveyId, siteId }, { rejectWithValue }) => {
    try {
      const { data } = await surveyServices.getSurvey(siteId, surveyId);
      return data;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

interface UserAttributes {
  siteId: string;
  surveyData: SurveyData;
  changeTab: (index: number) => void;
}

export const surveyAddRequest = createAsyncThunk<
  SelectedSurveyState['details'],
  UserAttributes,
  CreateAsyncThunkTypes
>(
  'selectedSurvey/addRequest',
  async ({ surveyData, siteId, changeTab }, { rejectWithValue }) => {
    try {
      const { data } = await surveyServices.addSurvey(siteId, surveyData);
      changeTab(1);
      return data;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

interface SurveyMediaEditRequestData {
  siteId: number;
  mediaId: number;
  data: Partial<SurveyMediaUpdateRequestData>;
  token: string;
}

export const surveyMediaEditRequest = createAsyncThunk<
  SurveyMedia,
  SurveyMediaEditRequestData,
  CreateAsyncThunkTypes
>(
  'selectedSurvey/editRequest',
  async ({ siteId, mediaId, data, token }, { rejectWithValue }) => {
    try {
      const response = await surveyServices.editSurveyMedia(
        siteId,
        mediaId,
        data,
        token,
      );
      return response.data;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

const surveyFormDraft = createSlice({
  name: 'survey',
  initialState: surveyFormDraftInitialState,
  reducers: {
    setDiveLocation: (
      state,
      action: PayloadAction<SurveyState['diveLocation']>,
    ) => ({
      ...state,
      diveLocation: action.payload,
    }),
  },
});

const selectedSurvey = createSlice({
  name: 'selectedSurvey',
  initialState: selectedSurveyInitialState,
  reducers: {
    clearSurvey: (state) => ({
      ...state,
      details: null,
    }),
    setSelectedPoi: (
      state,
      action: PayloadAction<SelectedSurveyState['selectedPoi']>,
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
      (state, action: PayloadAction<SelectedSurveyState['details']>) => ({
        ...state,
        details: action.payload,
        loading: false,
      }),
    );
    builder.addCase(
      surveyGetRequest.rejected,
      (state, action: PayloadAction<SelectedSurveyState['error']>) => ({
        ...state,
        error: action.payload,
        loading: false,
      }),
    );
    builder.addCase(surveyGetRequest.pending, (state) => ({
      ...state,
      loading: true,
      error: null,
    }));
    builder.addCase(
      surveyAddRequest.fulfilled,
      (state, action: PayloadAction<SelectedSurveyState['details']>) => ({
        ...state,
        details: action.payload,
        loading: false,
      }),
    );
    builder.addCase(
      surveyAddRequest.rejected,
      (state, action: PayloadAction<SelectedSurveyState['error']>) => ({
        ...state,
        error: action.payload,
        loading: false,
      }),
    );
    builder.addCase(surveyAddRequest.pending, (state) => ({
      ...state,
      loading: true,
      error: null,
    }));

    builder.addCase(
      surveyMediaEditRequest.fulfilled,
      (state, action: PayloadAction<SurveyMedia>) => {
        const surveyMedia = state.details?.surveyMedia?.find(
          (x) => x.id === action.payload.id,
        );
        if (action.payload.featured) {
          state.details?.surveyMedia?.forEach((media) => {
            // eslint-disable-next-line fp/no-mutation
            media.featured = false;
          });
        }
        // Here we mutate surveyMedia state instead of returning a new one, due to
        // the following strange behavior from redux + react:
        // <MediaDetails /> component renders <SliderCard /> by mapping surveyMedia redux state.
        // This was causing, in some cases, the first time of calling dispatch(surveyMediaEditRequest({...}))
        // to re initiate the <SliderCard /> component's state causing the SliderCard's snackbar failing to appear.
        // The creation of a new surveyMedia array, was probably confusing React.
        if (surveyMedia) {
          // eslint-disable-next-line fp/no-mutation
          surveyMedia.comments = action.payload.comments;
          // eslint-disable-next-line fp/no-mutation
          surveyMedia.featured = action.payload.featured;
          // eslint-disable-next-line fp/no-mutation
          surveyMedia.observations = action.payload.observations;
          // eslint-disable-next-line fp/no-mutation
          surveyMedia.surveyPoint = action.payload.surveyPoint;
        }
        // eslint-disable-next-line fp/no-mutation
        state.loadingSurveyMediaEdit = false;
      },
    );
    builder.addCase(
      surveyMediaEditRequest.rejected,
      (state, action: PayloadAction<SelectedSurveyState['error']>) => ({
        ...state,
        error: action.payload,
        loadingSurveyMediaEdit: false,
      }),
    );
    builder.addCase(surveyMediaEditRequest.pending, (state) => ({
      ...state,
      loadingSurveyMediaEdit: true,
      error: null,
    }));
  },
});

const survey = combineReducers({
  surveyFormDraft: surveyFormDraft.reducer,
  selectedSurvey: selectedSurvey.reducer,
});

export const diveLocationSelector = (
  state: RootState,
): SurveyState['diveLocation'] => state.survey.surveyFormDraft.diveLocation;

/* For surveyRequest */
export const surveyDetailsSelector = (
  state: RootState,
): SelectedSurveyState['details'] => state.survey.selectedSurvey.details;

export const selectedSurveyPointSelector = (
  state: RootState,
): SelectedSurveyState['selectedPoi'] =>
  state.survey.selectedSurvey.selectedPoi;

export const surveyLoadingSelector = (
  state: RootState,
): SelectedSurveyState['loading'] => state.survey.selectedSurvey.loading;

export const surveyMediaEditLoadingSelector = (
  state: RootState,
): SelectedSurveyState['loadingSurveyMediaEdit'] =>
  state.survey.selectedSurvey.loadingSurveyMediaEdit;

export const surveyErrorSelector = (
  state: RootState,
): SelectedSurveyState['error'] => state.survey.selectedSurvey.error;

export const { setDiveLocation } = surveyFormDraft.actions;
export const { setSelectedPoi, clearSurvey, setFeaturedImage } =
  selectedSurvey.actions;

export default survey;
