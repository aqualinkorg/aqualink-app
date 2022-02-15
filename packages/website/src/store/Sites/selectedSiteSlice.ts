import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { sortBy } from "lodash";
import type {
  OceanSenseData,
  OceanSenseDataRequestParams,
  SurveyPoints,
  SiteUpdateParams,
  SelectedSiteState,
  TimeSeriesDataRangeRequestParams,
  TimeSeriesDataRequestParams,
} from "./types";
import type { RootState, CreateAsyncThunkTypes } from "../configure";
import siteServices from "../../services/siteServices";
import {
  mapOceanSenseData,
  mapTimeSeriesDataRanges,
  timeSeriesRequest,
} from "./helpers";
import { getAxiosErrorMessage } from "../../helpers/errors";

const selectedSiteInitialState: SelectedSiteState = {
  draft: null,
  loading: true,
  timeSeriesDataLoading: false,
  timeSeriesDataRangeLoading: false,
  latestOceanSenseDataLoading: false,
  latestOceanSenseDataError: null,
  oceanSenseDataLoading: false,
  oceanSenseDataError: null,
  error: null,
};

export const siteRequest = createAsyncThunk<
  SelectedSiteState["details"],
  string,
  CreateAsyncThunkTypes
>(
  "selectedSite/request",
  async (id: string, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getSite(id);
      const { data: dailyData } = await siteServices.getSiteDailyData(id);
      const { data: liveData } = await siteServices.getSiteLiveData(id);
      const { data: surveyPoints } = await siteServices.getSiteSurveyPoints(id);

      return {
        ...data,
        dailyData,
        liveData,
        historicalMonthlyMean: sortBy(
          data.historicalMonthlyMean,
          (item) => item.month
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
    condition(id: string, { getState }) {
      const {
        selectedSite: { details },
      } = getState();
      return `${details?.id}` !== id;
    },
  }
);

export const siteOceanSenseDataRequest = createAsyncThunk<
  { data: OceanSenseData; latest?: boolean },
  OceanSenseDataRequestParams & { latest?: boolean },
  CreateAsyncThunkTypes
>(
  "selectedSite/oceanSenseDataRequest",
  async ({ latest, ...params }, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getOceanSenseData(params);
      return { data: mapOceanSenseData(data), latest };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  }
);

export const siteTimeSeriesDataRequest = createAsyncThunk<
  {
    granularDailyData: SelectedSiteState["granularDailyData"];
    timeSeriesData: SelectedSiteState["timeSeriesData"];
    timeSeriesMinRequestDate: SelectedSiteState["timeSeriesMinRequestDate"];
    timeSeriesMaxRequestDate: SelectedSiteState["timeSeriesMaxRequestDate"];
  },
  TimeSeriesDataRequestParams,
  CreateAsyncThunkTypes
>(
  "selectedSite/timeSeriesDataRequest",
  async (
    params: TimeSeriesDataRequestParams,
    { rejectWithValue, getState }
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
        storedEnd
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
  }
);

export const siteTimeSeriesDataRangeRequest = createAsyncThunk<
  SelectedSiteState["timeSeriesDataRange"],
  TimeSeriesDataRangeRequestParams,
  CreateAsyncThunkTypes
>(
  "selectedSite/timeSeriesDataRangeRequest",
  async (params: TimeSeriesDataRangeRequestParams, { rejectWithValue }) => {
    try {
      const { data } = await siteServices.getSiteTimeSeriesDataRange(params);
      return mapTimeSeriesDataRanges(data);
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  }
);

const selectedSiteSlice = createSlice({
  name: "selectedSite",
  initialState: selectedSiteInitialState,
  reducers: {
    setSiteDraft: (
      state,
      action: PayloadAction<SelectedSiteState["draft"]>
    ) => ({
      ...state,
      draft: action.payload,
    }),
    setSelectedSite: (
      state,
      action: PayloadAction<SelectedSiteState["details"]>
    ) => ({
      ...state,
      details: action.payload,
    }),
    setSiteData: (state, action: PayloadAction<SiteUpdateParams>) => {
      if (state.details) {
        return {
          ...state,
          details: {
            ...state.details,
            name: action.payload.name || state.details.name,
            depth: action.payload.depth || state.details.depth,
            polygon:
              state.details.polygon.type === "Point"
                ? {
                    ...state.details.polygon,
                    coordinates: [
                      action.payload.coordinates?.longitude ||
                        state.details.polygon.coordinates[0],
                      action.payload.coordinates?.latitude ||
                        state.details.polygon.coordinates[1],
                    ],
                  }
                : { ...state.details.polygon },
          },
        };
      }
      return state;
    },
    setSiteSurveyPoints: (state, action: PayloadAction<SurveyPoints[]>) => {
      if (state.details) {
        return {
          ...state,
          details: {
            ...state.details,
            surveyPoints: action.payload,
          },
        };
      }
      return state;
    },
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
    builder.addCase(
      siteRequest.fulfilled,
      (state, action: PayloadAction<SelectedSiteState["details"]>) => {
        return {
          ...state,
          details: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(
      siteRequest.rejected,
      (state, action: PayloadAction<SelectedSiteState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(siteRequest.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });

    builder.addCase(
      siteOceanSenseDataRequest.fulfilled,
      (
        state,
        action: PayloadAction<{ data: OceanSenseData; latest?: boolean }>
      ) => ({
        ...state,
        latestOceanSenseData: action.payload.latest
          ? action.payload.data
          : state.latestOceanSenseData,
        latestOceanSenseDataLoading: action.payload.latest
          ? false
          : state.latestOceanSenseDataLoading,
        oceanSenseData: !action.payload.latest
          ? action.payload.data
          : state.oceanSenseData,
        oceanSenseDataLoading: !action.payload.latest
          ? false
          : state.oceanSenseDataLoading,
      })
    );

    builder.addCase(siteOceanSenseDataRequest.rejected, (state, action) => {
      return {
        ...state,
        latestOceanSenseDataError: action.meta.arg.latest
          ? action.error.message
          : state.latestOceanSenseDataError,
        latestOceanSenseDataLoading: action.meta.arg.latest
          ? false
          : state.latestOceanSenseDataLoading,
        oceanSenseDataError: !action.meta.arg.latest
          ? action.error.message
          : state.oceanSenseDataError,
        oceanSenseDataLoading: !action.meta.arg.latest
          ? false
          : state.oceanSenseDataLoading,
      };
    });

    builder.addCase(siteOceanSenseDataRequest.pending, (state, action) => {
      return {
        ...state,
        latestOceanSenseDataLoading: action.meta.arg.latest
          ? true
          : state.latestOceanSenseDataLoading,
        latestOceanSenseDataError: action.meta.arg.latest
          ? null
          : state.latestOceanSenseDataError,
        oceanSenseDataLoading: !action.meta.arg.latest
          ? true
          : state.oceanSenseDataLoading,
        oceanSenseDataError: !action.meta.arg.latest
          ? null
          : state.oceanSenseDataError,
      };
    });

    builder.addCase(
      siteTimeSeriesDataRequest.fulfilled,
      (
        state,
        action: PayloadAction<{
          granularDailyData: SelectedSiteState["granularDailyData"];
          timeSeriesData: SelectedSiteState["timeSeriesData"];
          timeSeriesMinRequestDate: SelectedSiteState["timeSeriesMinRequestDate"];
          timeSeriesMaxRequestDate: SelectedSiteState["timeSeriesMaxRequestDate"];
        }>
      ) => ({
        ...state,
        granularDailyData: action.payload.granularDailyData,
        timeSeriesData: action.payload.timeSeriesData,
        timeSeriesMinRequestDate: action.payload.timeSeriesMinRequestDate,
        timeSeriesMaxRequestDate: action.payload.timeSeriesMaxRequestDate,
        timeSeriesDataLoading: false,
      })
    );

    builder.addCase(
      siteTimeSeriesDataRequest.rejected,
      (state, action: PayloadAction<SelectedSiteState["error"]>) => ({
        ...state,
        error: action.payload,
        timeSeriesDataLoading: false,
      })
    );

    builder.addCase(siteTimeSeriesDataRequest.pending, (state) => {
      return {
        ...state,
        timeSeriesDataLoading: true,
        error: null,
      };
    });

    builder.addCase(
      siteTimeSeriesDataRangeRequest.fulfilled,
      (
        state,
        action: PayloadAction<SelectedSiteState["timeSeriesDataRange"]>
      ) => ({
        ...state,
        timeSeriesDataRange: action.payload,
        timeSeriesDataRangeLoading: false,
      })
    );

    builder.addCase(
      siteTimeSeriesDataRangeRequest.rejected,
      (state, action: PayloadAction<SelectedSiteState["error"]>) => ({
        ...state,
        error: action.payload,
        timeSeriesDataRangeLoading: false,
      })
    );

    builder.addCase(siteTimeSeriesDataRangeRequest.pending, (state) => {
      return {
        ...state,
        timeSeriesDataRangeLoading: true,
        error: null,
      };
    });
  },
});

export const siteDetailsSelector = (
  state: RootState
): SelectedSiteState["details"] => state.selectedSite.details;

export const siteGranularDailyDataSelector = (
  state: RootState
): SelectedSiteState["granularDailyData"] =>
  state.selectedSite.granularDailyData;

export const siteTimeSeriesDataSelector = (
  state: RootState
): SelectedSiteState["timeSeriesData"] => state.selectedSite.timeSeriesData;

export const siteTimeSeriesDataLoadingSelector = (
  state: RootState
): SelectedSiteState["timeSeriesDataLoading"] =>
  state.selectedSite.timeSeriesDataLoading;

export const siteTimeSeriesDataRangeSelector = (
  state: RootState
): SelectedSiteState["timeSeriesDataRange"] =>
  state.selectedSite.timeSeriesDataRange;

export const siteTimeSeriesDataRangeLoadingSelector = (
  state: RootState
): SelectedSiteState["timeSeriesDataRangeLoading"] =>
  state.selectedSite.timeSeriesDataRangeLoading;

export const siteDraftSelector = (
  state: RootState
): SelectedSiteState["draft"] => state.selectedSite.draft;

export const siteLoadingSelector = (
  state: RootState
): SelectedSiteState["loading"] => state.selectedSite.loading;

export const siteErrorSelector = (
  state: RootState
): SelectedSiteState["error"] => state.selectedSite.error;

export const siteLatestOceanSenseDataSelector = (
  state: RootState
): SelectedSiteState["latestOceanSenseData"] =>
  state.selectedSite.latestOceanSenseData;

export const siteLatestOceanSenseDataLoadingSelector = (
  state: RootState
): SelectedSiteState["latestOceanSenseDataLoading"] =>
  state.selectedSite.latestOceanSenseDataLoading;

export const siteLatestOceanSenseDataErrorSelector = (
  state: RootState
): SelectedSiteState["latestOceanSenseDataError"] =>
  state.selectedSite.latestOceanSenseDataError;

export const siteOceanSenseDataSelector = (
  state: RootState
): SelectedSiteState["oceanSenseData"] => state.selectedSite.oceanSenseData;

export const siteOceanSenseDataLoadingSelector = (
  state: RootState
): SelectedSiteState["oceanSenseDataLoading"] =>
  state.selectedSite.oceanSenseDataLoading;

export const siteOceanSenseDataErrorSelector = (
  state: RootState
): SelectedSiteState["oceanSenseDataError"] =>
  state.selectedSite.oceanSenseDataError;

export const {
  setSiteDraft,
  setSelectedSite,
  setSiteData,
  clearTimeSeriesData,
  clearTimeSeriesDataRange,
  clearGranularDailyData,
  clearOceanSenseData,
  setSiteSurveyPoints,
} = selectedSiteSlice.actions;

export default selectedSiteSlice.reducer;
