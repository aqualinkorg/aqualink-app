import {
  ActionReducerMapBuilder,
  createSlice,
  createAsyncThunk,
  PayloadAction,
} from '@reduxjs/toolkit';
import { isNil, omit, omitBy, sortBy } from 'lodash';
import { getAxiosErrorMessage } from 'helpers/errors';
import siteServices from 'services/siteServices';
import type {
  OceanSenseData,
  OceanSenseDataRequestParams,
  SurveyPoints,
  SiteUpdateParams,
  SelectedSiteState,
  SiteRequestArgs,
  TimeSeriesDataRangeRequestParams,
  TimeSeriesDataRequestParams,
  GetSiteContactInfoProps,
  Site,
  Metrics,
  TimeSeries,
} from './types';
import type { RootState, CreateAsyncThunkTypes } from '../configure';
import {
  mapOceanSenseData,
  mapTimeSeriesDataRanges,
  timeSeriesRequest,
} from './helpers';
import {
  buildHistoricalLatestData,
  normalizeSiteRequestArgs,
  toHistoricalEndOfDayIso,
} from './historicalDateHelpers';

const selectedSiteInitialState: SelectedSiteState = {
  draft: null,
  requestedDate: null,
  loading: true,
  loadingSpotterPosition: 0,
  timeSeriesDataLoading: false,
  timeSeriesDataRangeLoading: false,
  latestOceanSenseDataLoading: false,
  contactInfoLoading: false,
  latestOceanSenseDataError: null,
  oceanSenseDataLoading: false,
  oceanSenseDataError: null,
  error: null,
};

const AlreadyLoadingErrorMessage = 'Request already loading';

const resolveUpdatedPolygon = (
  polygon: Site['polygon'],
  coordinates?: SiteUpdateParams['coordinates'],
): Site['polygon'] => {
  if (polygon.type !== 'Point') {
    return { ...polygon };
  }
  return {
    ...polygon,
    coordinates: [
      coordinates?.longitude || polygon.coordinates[0],
      coordinates?.latitude || polygon.coordinates[1],
    ],
  };
};

const applySiteUpdateToDetails = (
  details: Site,
  payload: SiteUpdateParams,
): Site => {
  const definedFields = omitBy(omit(payload, ['coordinates', 'videoStream']), (val) =>
    isNil(val) || val === '',
  );
  return {
    ...details,
    ...definedFields,
    polygon: resolveUpdatedPolygon(details.polygon, payload.coordinates),
    videoStream:
      payload.videoStream !== undefined
        ? payload.videoStream
        : details.videoStream,
  };
};

const mergeTimeSeriesByMetric = (
  oldTimeSeries: SelectedSiteState['timeSeriesData'] = {},
  newTimeSeries: SelectedSiteState['timeSeriesData'] = {},
): Partial<Record<Metrics, TimeSeries>> => {
  const keys = [
    ...new Set([
      ...Object.keys(oldTimeSeries),
      ...Object.keys(newTimeSeries),
    ]),
  ] as Metrics[];

  return keys.reduce<Partial<Record<Metrics, TimeSeries>>>((acc, key) => {
    const existingSeries = oldTimeSeries[key];
    const incomingSeries = newTimeSeries[key];
    if (existingSeries && incomingSeries) {
      const incomingTypes = incomingSeries.map((x) => x.type);
      const preserved = existingSeries.filter(
        (x) => !incomingTypes.includes(x.type),
      );
      return { ...acc, [key]: [...preserved, ...incomingSeries] };
    }
    return { ...acc, [key]: incomingSeries || existingSeries };
  }, {});
};

export const forecastDataRequest = createAsyncThunk<
  SelectedSiteState['forecastData'],
  string,
  CreateAsyncThunkTypes
>(
  'selectedSite/requestForecastData',
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getSiteForecastData(id);
      return data;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

export const spotterPositionRequest = createAsyncThunk<
  SelectedSiteState['spotterPosition'],
  string,
  CreateAsyncThunkTypes
>(
  'selectedSite/requestSpotterPosition',
  async (id: string, { rejectWithValue, getState }) => {
    const state = getState();
    if (state.selectedSite.loadingSpotterPosition !== 1) {
      return rejectWithValue(AlreadyLoadingErrorMessage);
    }
    try {
      const { data: spotterPositionData } =
        await siteServices.getSiteSpotterPosition(id);
      return spotterPositionData;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

export const latestDataRequest = createAsyncThunk<
  SelectedSiteState['latestData'],
  string,
  CreateAsyncThunkTypes
>('selectedSite/requestLatestData', async (id: string, { rejectWithValue }) => {
  try {
    const { data: latestData } = await siteServices.getSiteLatestData(id);
    return latestData.latestData;
  } catch (err) {
    return rejectWithValue(getAxiosErrorMessage(err));
  }
});

export const siteRequest = createAsyncThunk<
  SelectedSiteState['details'],
  SiteRequestArgs,
  CreateAsyncThunkTypes
>(
  'selectedSite/request',
  async (args: SiteRequestArgs, { rejectWithValue }) => {
    try {
      const { id, date } = normalizeSiteRequestArgs(args);
      const dailyEnd = date ? toHistoricalEndOfDayIso(date) : undefined;
      const [{ data }, { data: dailyData }, { data: surveyPoints }] =
        await Promise.all([
          siteServices.getSite(id, date),
          siteServices.getSiteDailyData(id, undefined, dailyEnd),
          siteServices.getSiteSurveyPoints(id),
        ]);

      return {
        ...data,
        collectionData: data.collectionData || {},
        dailyData,
        historicalMonthlyMean: sortBy(
          data.historicalMonthlyMean,
          (item) => item.month,
        ).map((item) => ({
          id: item.id,
          month: item.month,
          temperature: item.temperature,
        })),
        surveyPoints: surveyPoints.map((point) => ({
          id: point.id,
          name: point.name,
          polygon: point.polygon,
        })),
      };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
  {
    condition(args: SiteRequestArgs, { getState }) {
      const { id, date } = normalizeSiteRequestArgs(args);
      const {
        selectedSite: { details, requestedDate },
      } = getState();
      return `${details?.id}` !== id || (requestedDate || undefined) !== date;
    },
  },
);

export const siteOceanSenseDataRequest = createAsyncThunk<
  { data: OceanSenseData; latest?: boolean },
  OceanSenseDataRequestParams & { latest?: boolean },
  CreateAsyncThunkTypes
>(
  'selectedSite/oceanSenseDataRequest',
  async ({ latest, ...params }, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getOceanSenseData(params);
      return { data: mapOceanSenseData(data), latest };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

export const siteTimeSeriesDataRequest = createAsyncThunk<
  {
    granularDailyData: SelectedSiteState['granularDailyData'];
    timeSeriesData: SelectedSiteState['timeSeriesData'];
    timeSeriesMinRequestDate: SelectedSiteState['timeSeriesMinRequestDate'];
    timeSeriesMaxRequestDate: SelectedSiteState['timeSeriesMaxRequestDate'];
  },
  TimeSeriesDataRequestParams,
  CreateAsyncThunkTypes
>(
  'selectedSite/timeSeriesDataRequest',
  async (
    params: TimeSeriesDataRequestParams,
    { rejectWithValue, getState },
  ) => {
    try {
      const {
        timeSeriesMinRequestDate: storedStart,
        timeSeriesMaxRequestDate: storedEnd,
        timeSeriesData: storedTimeSeries,
        granularDailyData: storedDailyData,
      } = getState().selectedSite;
      const [
        timeSeriesData,
        granularDailyData,
        timeSeriesMinRequestDate,
        timeSeriesMaxRequestDate,
      ] = await timeSeriesRequest(
        params,
        storedTimeSeries,
        storedDailyData,
        storedStart,
        storedEnd,
      );

      return {
        timeSeriesData,
        granularDailyData,
        timeSeriesMinRequestDate,
        timeSeriesMaxRequestDate,
      };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

export const siteTimeSeriesDataRangeRequest = createAsyncThunk<
  SelectedSiteState['timeSeriesDataRange'],
  TimeSeriesDataRangeRequestParams,
  CreateAsyncThunkTypes
>(
  'selectedSite/timeSeriesDataRangeRequest',
  async (params: TimeSeriesDataRangeRequestParams, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getSiteTimeSeriesDataRange(params);
      return mapTimeSeriesDataRanges(data);
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

export const siteContactInfoRequest = createAsyncThunk<
  Site['contactInformation'],
  GetSiteContactInfoProps,
  CreateAsyncThunkTypes
>(
  'selectedSite/siteContactInfoRequest',
  async (params: GetSiteContactInfoProps, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getSiteContactInfo(params);
      return data.contactInformation;
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

const applyFulfilledSiteDetails = (
  state: SelectedSiteState,
  payload: SelectedSiteState['details'],
): SelectedSiteState => {
  if (!state.requestedDate) {
    return {
      ...state,
      details: payload,
      loading: false,
    };
  }
  return {
    ...state,
    details: payload,
    latestData: buildHistoricalLatestData(payload?.dailyData),
    forecastData: [],
    loading: false,
  };
};

const registerSiteDetailReducers = (
  builder: ActionReducerMapBuilder<SelectedSiteState>,
) => {
  builder.addCase(siteRequest.fulfilled, (state, action) => {
    const requestDate = normalizeSiteRequestArgs(action.meta.arg).date ?? null;
    if ((state.requestedDate ?? null) !== requestDate) {
      return state;
    }
    return applyFulfilledSiteDetails(state, action.payload);
  });

  builder.addCase(
    siteRequest.rejected,
    (state, action: PayloadAction<SelectedSiteState['error']>) => ({
      ...state,
      error: action.payload,
      loading: false,
    }),
  );

  builder.addCase(siteRequest.pending, (state, action) => {
    const nextDate = normalizeSiteRequestArgs(action.meta.arg).date ?? null;
    const resetTelemetry = (state.requestedDate ?? null) !== nextDate;
    return {
      ...state,
      requestedDate: nextDate,
      latestData: resetTelemetry ? null : state.latestData,
      forecastData: resetTelemetry ? null : state.forecastData,
      loading: true,
      error: null,
    };
  });
};

const registerLiveTelemetryReducers = (
  builder: ActionReducerMapBuilder<SelectedSiteState>,
) => {
  builder.addCase(
    forecastDataRequest.fulfilled,
    (state, action: PayloadAction<SelectedSiteState['forecastData']>) => ({
      ...state,
      forecastData: state.requestedDate ? [] : action.payload,
    }),
  );
  builder.addCase(
    forecastDataRequest.rejected,
    (state, action: PayloadAction<SelectedSiteState['error']>) => ({
      ...state,
      error: action.payload,
    }),
  );
  builder.addCase(forecastDataRequest.pending, (state) => ({
    ...state,
    error: null,
  }));

  builder.addCase(
    spotterPositionRequest.fulfilled,
    (state, action: PayloadAction<SelectedSiteState['spotterPosition']>) => ({
      ...state,
      spotterPosition: action.payload,
      loadingSpotterPosition: state.loadingSpotterPosition - 1,
    }),
  );
  builder.addCase(
    spotterPositionRequest.rejected,
    (state, action: PayloadAction<SelectedSiteState['error']>) => ({
      ...state,
      error:
        action.payload === AlreadyLoadingErrorMessage ? null : action.payload,
      loadingSpotterPosition: state.loadingSpotterPosition - 1,
    }),
  );
  builder.addCase(spotterPositionRequest.pending, (state) => ({
    ...state,
    loadingSpotterPosition: state.loadingSpotterPosition + 1,
    error: null,
  }));

  builder.addCase(
    latestDataRequest.fulfilled,
    (state, action: PayloadAction<SelectedSiteState['latestData']>) => ({
      ...state,
      latestData: state.requestedDate ? state.latestData : action.payload,
    }),
  );
  builder.addCase(
    latestDataRequest.rejected,
    (state, action: PayloadAction<SelectedSiteState['error']>) => ({
      ...state,
      error: action.payload,
    }),
  );
  builder.addCase(latestDataRequest.pending, (state) => ({
    ...state,
    error: null,
  }));
};

const registerOceanSenseReducers = (
  builder: ActionReducerMapBuilder<SelectedSiteState>,
) => {
  builder.addCase(
    siteOceanSenseDataRequest.fulfilled,
    (
      state,
      action: PayloadAction<{ data: OceanSenseData; latest?: boolean }>,
    ) => {
      if (action.payload.latest) {
        return {
          ...state,
          latestOceanSenseData: action.payload.data,
          latestOceanSenseDataLoading: false,
        };
      }
      return {
        ...state,
        oceanSenseData: action.payload.data,
        oceanSenseDataLoading: false,
      };
    },
  );

  builder.addCase(siteOceanSenseDataRequest.rejected, (state, action) => {
    if (action.meta.arg.latest) {
      return {
        ...state,
        latestOceanSenseDataError: action.error.message,
        latestOceanSenseDataLoading: false,
      };
    }
    return {
      ...state,
      oceanSenseDataError: action.error.message,
      oceanSenseDataLoading: false,
    };
  });

  builder.addCase(siteOceanSenseDataRequest.pending, (state, action) => {
    if (action.meta.arg.latest) {
      return {
        ...state,
        latestOceanSenseDataLoading: true,
        latestOceanSenseDataError: null,
      };
    }
    return {
      ...state,
      oceanSenseDataLoading: true,
      oceanSenseDataError: null,
    };
  });
};

const registerTimeSeriesReducers = (
  builder: ActionReducerMapBuilder<SelectedSiteState>,
) => {
  builder.addCase(siteTimeSeriesDataRequest.fulfilled, (state, action) => ({
    ...state,
    granularDailyData: action.payload.granularDailyData,
    timeSeriesData: mergeTimeSeriesByMetric(
      state.timeSeriesData,
      action.payload.timeSeriesData,
    ),
    timeSeriesMinRequestDate: action.payload.timeSeriesMinRequestDate,
    timeSeriesMaxRequestDate: action.payload.timeSeriesMaxRequestDate,
    timeSeriesDataLoading: false,
  }));
  builder.addCase(
    siteTimeSeriesDataRequest.rejected,
    (state, action: PayloadAction<SelectedSiteState['error']>) => ({
      ...state,
      error: action.payload,
      timeSeriesDataLoading: false,
    }),
  );
  builder.addCase(siteTimeSeriesDataRequest.pending, (state) => ({
    ...state,
    timeSeriesDataLoading: true,
    error: null,
  }));
};

const registerRangeAndContactReducers = (
  builder: ActionReducerMapBuilder<SelectedSiteState>,
) => {
  builder.addCase(
    siteTimeSeriesDataRangeRequest.fulfilled,
    (
      state,
      action: PayloadAction<SelectedSiteState['timeSeriesDataRange']>,
    ) => ({
      ...state,
      timeSeriesDataRange: action.payload,
      timeSeriesDataRangeLoading: false,
    }),
  );
  builder.addCase(
    siteTimeSeriesDataRangeRequest.rejected,
    (state, action: PayloadAction<SelectedSiteState['error']>) => ({
      ...state,
      error: action.payload,
      timeSeriesDataRangeLoading: false,
    }),
  );
  builder.addCase(siteTimeSeriesDataRangeRequest.pending, (state) => ({
    ...state,
    timeSeriesDataRangeLoading: true,
    error: null,
  }));

  builder.addCase(
    siteContactInfoRequest.fulfilled,
    (state, action: PayloadAction<Site['contactInformation']>) => ({
      ...state,
      details: state.details
        ? { ...state.details, contactInformation: action.payload }
        : state.details,
      contactInfoLoading: false,
    }),
  );
  builder.addCase(
    siteContactInfoRequest.rejected,
    (state, action: PayloadAction<SelectedSiteState['error']>) => ({
      ...state,
      error: action.payload,
      contactInfoLoading: false,
    }),
  );
  builder.addCase(siteContactInfoRequest.pending, (state) => ({
    ...state,
    contactInfoLoading: true,
    error: null,
  }));
};

const selectedSiteSlice = createSlice({
  name: 'selectedSite',
  initialState: selectedSiteInitialState,
  reducers: {
    setSiteDraft: (
      state,
      action: PayloadAction<SelectedSiteState['draft']>,
    ) => ({
      ...state,
      draft: action.payload,
    }),
    setSelectedSite: (
      state,
      action: PayloadAction<SelectedSiteState['details']>,
    ) => ({
      ...state,
      details: action.payload,
    }),
    unsetSelectedSite: (state) => ({
      ...state,
      details: null,
    }),
    unsetSpotterPosition: (state) => ({
      ...state,
      spotterPosition: null,
    }),
    unsetLatestData: (state) => ({
      ...state,
      latestData: null,
    }),
    unsetForecastData: (state) => ({
      ...state,
      forecastData: null,
    }),
    setSiteData: (state, action: PayloadAction<SiteUpdateParams>) =>
      state.details
        ? {
            ...state,
            details: applySiteUpdateToDetails(state.details, action.payload),
          }
        : state,
    setSiteSurveyPoints: (state, action: PayloadAction<SurveyPoints[]>) =>
      state.details
        ? {
            ...state,
            details: {
              ...state.details,
              surveyPoints: action.payload,
            },
          }
        : state,
    clearTimeSeriesData: (state) => ({
      ...state,
      timeSeriesData: undefined,
      timeSeriesMaxRequestDate: undefined,
      timeSeriesMinRequestDate: undefined,
    }),
    clearTimeSeriesDataRange: (state) => ({
      ...state,
      timeSeriesDataRange: undefined,
    }),
    clearGranularDailyData: (state) => ({
      ...state,
      granularDailyData: undefined,
    }),
    clearOceanSenseData: (state) => ({
      ...state,
      oceanSenseData: undefined,
      latestOceanSenseData: undefined,
    }),
  },
  extraReducers: (builder) => {
    registerSiteDetailReducers(builder);
    registerLiveTelemetryReducers(builder);
    registerOceanSenseReducers(builder);
    registerTimeSeriesReducers(builder);
    registerRangeAndContactReducers(builder);
  },
});

export const siteDetailsSelector = (
  state: RootState,
): SelectedSiteState['details'] => state.selectedSite.details;

export const spotterPositionSelector = (
  state: RootState,
): SelectedSiteState['spotterPosition'] => state.selectedSite.spotterPosition;

export const latestDataSelector = (
  state: RootState,
): SelectedSiteState['latestData'] => state.selectedSite.latestData;

export const forecastDataSelector = (
  state: RootState,
): SelectedSiteState['forecastData'] => state.selectedSite.forecastData;

export const siteGranularDailyDataSelector = (
  state: RootState,
): SelectedSiteState['granularDailyData'] =>
  state.selectedSite.granularDailyData;

export const siteTimeSeriesDataSelector = (
  state: RootState,
): SelectedSiteState['timeSeriesData'] => state.selectedSite.timeSeriesData;

export const siteTimeSeriesDataLoadingSelector = (
  state: RootState,
): SelectedSiteState['timeSeriesDataLoading'] =>
  state.selectedSite.timeSeriesDataLoading;

export const siteTimeSeriesDataRangeSelector = (
  state: RootState,
): SelectedSiteState['timeSeriesDataRange'] =>
  state.selectedSite.timeSeriesDataRange;

export const siteTimeSeriesDataRangeLoadingSelector = (
  state: RootState,
): SelectedSiteState['timeSeriesDataRangeLoading'] =>
  state.selectedSite.timeSeriesDataRangeLoading;

export const siteDraftSelector = (
  state: RootState,
): SelectedSiteState['draft'] => state.selectedSite.draft;

export const siteLoadingSelector = (
  state: RootState,
): SelectedSiteState['loading'] => state.selectedSite.loading;

export const siteErrorSelector = (
  state: RootState,
): SelectedSiteState['error'] => state.selectedSite.error;

export const siteLatestOceanSenseDataSelector = (
  state: RootState,
): SelectedSiteState['latestOceanSenseData'] =>
  state.selectedSite.latestOceanSenseData;

export const siteLatestOceanSenseDataLoadingSelector = (
  state: RootState,
): SelectedSiteState['latestOceanSenseDataLoading'] =>
  state.selectedSite.latestOceanSenseDataLoading;

export const siteLatestOceanSenseDataErrorSelector = (
  state: RootState,
): SelectedSiteState['latestOceanSenseDataError'] =>
  state.selectedSite.latestOceanSenseDataError;

export const siteOceanSenseDataSelector = (
  state: RootState,
): SelectedSiteState['oceanSenseData'] => state.selectedSite.oceanSenseData;

export const siteOceanSenseDataLoadingSelector = (
  state: RootState,
): SelectedSiteState['oceanSenseDataLoading'] =>
  state.selectedSite.oceanSenseDataLoading;

export const siteOceanSenseDataErrorSelector = (
  state: RootState,
): SelectedSiteState['oceanSenseDataError'] =>
  state.selectedSite.oceanSenseDataError;

export const siteContactInfoLoadingSelector = (
  state: RootState,
): SelectedSiteState['contactInfoLoading'] =>
  state.selectedSite.contactInfoLoading;

export const {
  setSiteDraft,
  setSelectedSite,
  setSiteData,
  unsetSelectedSite,
  unsetSpotterPosition,
  unsetLatestData,
  unsetForecastData,
  setSiteSurveyPoints,
  clearTimeSeriesData,
  clearTimeSeriesDataRange,
  clearGranularDailyData,
  clearOceanSenseData,
} = selectedSiteSlice.actions;

export default selectedSiteSlice.reducer;
