import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getAxiosErrorMessage } from 'helpers/errors';
import { getReefCheckSurvey } from 'services/reefCheckService';
import type { CreateAsyncThunkTypes, RootState } from 'store/configure';
import { ReefCheckSurvey, ReefCheckSurveyState } from './types';

interface GetReefCheckSurveyParams {
  surveyId: string;
  siteId: string;
}

const initialState: ReefCheckSurveyState = {
  loading: true,
  error: undefined,
  survey: null,
};

export const reefCheckSurveyGetRequest = createAsyncThunk<
  ReefCheckSurvey,
  GetReefCheckSurveyParams,
  CreateAsyncThunkTypes
>(
  'selectedSurvey/getRequest',
  async ({ surveyId, siteId }, { rejectWithValue }) => {
    try {
      const { data } = await getReefCheckSurvey(siteId, surveyId);
      return data;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

const selectedReefCheckSurvey = createSlice({
  name: 'selectedReefCheckSurvey',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(reefCheckSurveyGetRequest.pending, (state) => ({
      ...state,
      loading: true,
    }));
    builder.addCase(reefCheckSurveyGetRequest.fulfilled, (state, action) => ({
      ...state,
      loading: false,
      survey: action.payload,
    }));
    builder.addCase(reefCheckSurveyGetRequest.rejected, (state, action) => ({
      ...state,
      loading: false,
      error: action.payload,
    }));
  },
});

const reefCheckSurvey = selectedReefCheckSurvey.reducer;

export const reefCheckSurveySelector = (state: RootState) =>
  state.reefCheckSurvey;

export default reefCheckSurvey;
