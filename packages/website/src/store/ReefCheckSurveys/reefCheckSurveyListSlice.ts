import { sortBy } from 'lodash';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { getAxiosErrorMessage } from 'helpers/errors';
import { getReefCheckSurveys } from 'services/reefCheckService';
import { ReefCheckSurveyListState } from './types';

import type { RootState, CreateAsyncThunkTypes } from '../configure';

const surveyListInitialState: ReefCheckSurveyListState = {
  list: [],
  loading: false,
};

const getSurveys = async (siteId: string) => {
  try {
    const { data } = await getReefCheckSurveys(siteId);
    return sortBy(data, 'date');
  } catch (err) {
    return Promise.reject(getAxiosErrorMessage(err));
  }
};

export const reefCheckSurveysRequest = createAsyncThunk<
  ReefCheckSurveyListState['list'],
  string,
  CreateAsyncThunkTypes
>('surveysList/request', (siteId: string) => getSurveys(siteId));

const reefCheckSurveyListSlice = createSlice({
  name: 'surveyList',
  initialState: surveyListInitialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(
      reefCheckSurveysRequest.fulfilled,
      (state, action: PayloadAction<ReefCheckSurveyListState['list']>) => {
        return {
          ...state,
          list: action.payload,
          loading: false,
        };
      },
    );

    builder.addCase(reefCheckSurveysRequest.rejected, (state, action) => {
      return {
        ...state,
        error: action.error.message
          ? action.error.message
          : action.error.toString(),
        loading: false,
      };
    });

    builder.addCase(reefCheckSurveysRequest.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: undefined,
      };
    });
  },
});

export const reefCheckSurveyList = reefCheckSurveyListSlice.reducer;

export const reefCheckSurveyListSelector = (
  state: RootState,
): ReefCheckSurveyListState => state.reefCheckSurveyList;

export default reefCheckSurveyListSlice.reducer;
