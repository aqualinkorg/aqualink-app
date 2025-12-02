import { sortBy } from 'lodash';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

import { getAxiosErrorMessage } from 'helpers/errors';
import surveyServices from 'services/surveyServices';
import { SurveyListState } from './types';

import type { RootState, CreateAsyncThunkTypes } from '../configure';

const surveyListInitialState: SurveyListState = {
  list: [],
  loading: false,
  error: null,
};

const getSurveys = async (siteId: string) => {
  try {
    const { data } = await surveyServices.getSurveys(siteId);
    return sortBy(data, 'diveDate');
  } catch (err) {
    return Promise.reject(getAxiosErrorMessage(err));
  }
};

export const surveysRequest = createAsyncThunk<
  SurveyListState['list'],
  string,
  CreateAsyncThunkTypes
>('surveysList/request', (siteId: string) => getSurveys(siteId));

const surveyListSlice = createSlice({
  name: 'surveyList',
  initialState: surveyListInitialState,
  reducers: {
    updateSurveyPointName: (
      state,
      action: PayloadAction<{ id: number; name: string }>,
    ) => ({
      ...state,
      list: state.list.map((item) => {
        if (item.featuredSurveyMedia?.surveyPoint?.id === action.payload.id) {
          return {
            ...item,
            featuredSurveyMedia: {
              ...item.featuredSurveyMedia,
              surveyPoint: {
                ...item.featuredSurveyMedia.surveyPoint,
                name: action.payload.name,
              },
            },
          };
        }
        return item;
      }),
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(
      surveysRequest.fulfilled,
      (state, action: PayloadAction<SurveyListState['list']>) => ({
        ...state,
        list: action.payload.filter((survey) => survey.featuredSurveyMedia),
        loading: false,
      }),
    );

    builder.addCase(surveysRequest.rejected, (state, action) => ({
      ...state,
      error: action.error.message
        ? action.error.message
        : action.error.toString(),
      loading: false,
    }));

    builder.addCase(surveysRequest.pending, (state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  },
});

export const surveyListSelector = (state: RootState): SurveyListState['list'] =>
  state.surveyList.list;

export const surveyListLoadingSelector = (
  state: RootState,
): SurveyListState['loading'] => state.surveyList.loading;

export const surveyListErrorSelector = (
  state: RootState,
): SurveyListState['error'] => state.surveyList.error;

export const { updateSurveyPointName } = surveyListSlice.actions;

export default surveyListSlice.reducer;
