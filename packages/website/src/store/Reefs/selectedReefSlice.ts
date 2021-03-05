import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { sortBy } from "lodash";
import type { AxiosError } from "axios";
import type {
  HoboDataRangeRequestParams,
  HoboDataRequestParams,
  Pois,
  ReefUpdateParams,
  SelectedReefState,
  SpotterDataRequestParams,
} from "./types";
import type { RootState, CreateAsyncThunkTypes } from "../configure";
import reefServices from "../../services/reefServices";
import { mapHoboData, mapHoboDataRanges } from "./helpers";

const selectedReefInitialState: SelectedReefState = {
  draft: null,
  loading: true,
  hoboDataLoading: false,
  hoboDataRangeLoading: false,
  spotterDataLoading: false,
  error: null,
};

export const reefRequest = createAsyncThunk<
  SelectedReefState["details"],
  string,
  CreateAsyncThunkTypes
>("selectedReef/request", async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await reefServices.getReef(id);
    const { data: dailyData } = await reefServices.getReefDailyData(id);
    const { data: liveData } = await reefServices.getReefLiveData(id);
    const { data: surveyPoints } = await reefServices.getReefPois(id);

    return {
      ...data,
      dailyData,
      liveData,
      monthlyMax: sortBy(data.monthlyMax, (item) => item.month).map((item) => ({
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
    const error: AxiosError<SelectedReefState["error"]> = err;
    return rejectWithValue(error.message);
  }
});

export const reefSpotterDataRequest = createAsyncThunk<
  SelectedReefState["spotterData"],
  SpotterDataRequestParams,
  CreateAsyncThunkTypes
>(
  "selectedReef/spotterDataRequest",
  async (
    { id, startDate, endDate }: SpotterDataRequestParams,
    { rejectWithValue }
  ) => {
    try {
      const { data: spotterData } = await reefServices.getReefSpotterData(
        id,
        startDate,
        endDate
      );
      return spotterData;
    } catch (err) {
      const error: AxiosError<SelectedReefState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

export const reefHoboDataRequest = createAsyncThunk<
  SelectedReefState["hoboData"],
  HoboDataRequestParams,
  CreateAsyncThunkTypes
>(
  "selectedReef/hoboDataRequest",
  async (
    { reefId, pointId, start, end, metrics, hourly }: HoboDataRequestParams,
    { rejectWithValue }
  ) => {
    try {
      const { data: hoboData } = await reefServices.getReefHoboData(
        reefId,
        pointId,
        start,
        end,
        metrics,
        hourly
      );
      return mapHoboData(hoboData);
    } catch (err) {
      const error: AxiosError<SelectedReefState["error"]> = err;
      return rejectWithValue(error.message);
    }
  },
  {
    // If another hobo data action is pending, cancel this request before it starts.
    condition(arg: HoboDataRequestParams, { getState }) {
      const {
        selectedReef: { hoboDataRangeLoading },
      } = getState();
      return !hoboDataRangeLoading;
    },
  }
);

export const reefHoboDataRangeRequest = createAsyncThunk<
  SelectedReefState["hoboDataRange"],
  HoboDataRangeRequestParams,
  CreateAsyncThunkTypes
>(
  "selectedReef/hoboDataRangeRequest",
  async (
    { reefId, pointId }: HoboDataRangeRequestParams,
    { rejectWithValue }
  ) => {
    try {
      const { data } = await reefServices.getReefHoboDataRange(reefId, pointId);
      return mapHoboDataRanges(data);
    } catch (err) {
      const error: AxiosError<SelectedReefState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

const selectedReefSlice = createSlice({
  name: "selectedReef",
  initialState: selectedReefInitialState,
  reducers: {
    setReefDraft: (
      state,
      action: PayloadAction<SelectedReefState["draft"]>
    ) => ({
      ...state,
      draft: action.payload,
    }),
    setSelectedReef: (
      state,
      action: PayloadAction<SelectedReefState["details"]>
    ) => ({
      ...state,
      details: action.payload,
    }),
    setReefData: (state, action: PayloadAction<ReefUpdateParams>) => {
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
    clearReefSpotterData: (state) => ({
      ...state,
      spotterData: null,
    }),
    setReefPois: (state, action: PayloadAction<Pois[]>) => {
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
    clearHoboData: (state) => ({ ...state, hoboData: undefined }),
    clearHoboDataRange: (state) => ({ ...state, hoboDataRange: undefined }),
  },
  extraReducers: (builder) => {
    builder.addCase(
      reefRequest.fulfilled,
      (state, action: PayloadAction<SelectedReefState["details"]>) => {
        return {
          ...state,
          details: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(
      reefRequest.rejected,
      (state, action: PayloadAction<SelectedReefState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(reefRequest.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });

    builder.addCase(
      reefSpotterDataRequest.fulfilled,
      (state, action: PayloadAction<SelectedReefState["spotterData"]>) => {
        return {
          ...state,
          spotterData: action.payload,
          spotterDataLoading: false,
        };
      }
    );

    builder.addCase(
      reefSpotterDataRequest.rejected,
      (state, action: PayloadAction<SelectedReefState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          spotterDataLoading: false,
        };
      }
    );

    builder.addCase(reefSpotterDataRequest.pending, (state) => {
      return {
        ...state,
        spotterDataLoading: true,
        error: null,
      };
    });

    builder.addCase(
      reefHoboDataRequest.fulfilled,
      (state, action: PayloadAction<SelectedReefState["hoboData"]>) => ({
        ...state,
        hoboData: action.payload,
        hoboDataLoading: false,
      })
    );

    builder.addCase(
      reefHoboDataRequest.rejected,
      (state, action: PayloadAction<SelectedReefState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          hoboDataLoading: false,
        };
      }
    );

    builder.addCase(reefHoboDataRequest.pending, (state) => {
      return {
        ...state,
        hoboDataLoading: true,
        error: null,
      };
    });

    builder.addCase(
      reefHoboDataRangeRequest.fulfilled,
      (state, action: PayloadAction<SelectedReefState["hoboDataRange"]>) => ({
        ...state,
        hoboDataRange: action.payload,
        hoboDataRangeLoading: false,
      })
    );

    builder.addCase(
      reefHoboDataRangeRequest.rejected,
      (state, action: PayloadAction<SelectedReefState["error"]>) => ({
        ...state,
        error: action.payload,
        hoboDataRangeLoading: false,
      })
    );

    builder.addCase(reefHoboDataRangeRequest.pending, (state) => {
      return {
        ...state,
        hoboDataRangeLoading: true,
        error: null,
      };
    });
  },
});

export const reefDetailsSelector = (
  state: RootState
): SelectedReefState["details"] => state.selectedReef.details;

export const reefSpotterDataSelector = (
  state: RootState
): SelectedReefState["spotterData"] => state.selectedReef.spotterData;

export const reefHoboDataSelector = (
  state: RootState
): SelectedReefState["hoboData"] => state.selectedReef.hoboData;

export const reefHoboDataRangeSelector = (
  state: RootState
): SelectedReefState["hoboDataRange"] => state.selectedReef.hoboDataRange;

export const reefDraftSelector = (
  state: RootState
): SelectedReefState["draft"] => state.selectedReef.draft;

export const reefLoadingSelector = (
  state: RootState
): SelectedReefState["loading"] => state.selectedReef.loading;

export const reefSpotterDataLoadingSelector = (
  state: RootState
): SelectedReefState["spotterDataLoading"] =>
  state.selectedReef.spotterDataLoading;

export const reefHoboDataLoadingSelector = (
  state: RootState
): SelectedReefState["hoboDataLoading"] => state.selectedReef.hoboDataLoading;

export const reefHoboDataRangeLoadingSelector = (
  state: RootState
): SelectedReefState["hoboDataRangeLoading"] =>
  state.selectedReef.hoboDataRangeLoading;

export const reefErrorSelector = (
  state: RootState
): SelectedReefState["error"] => state.selectedReef.error;

export const {
  setReefDraft,
  setSelectedReef,
  setReefData,
  clearReefSpotterData,
  clearHoboData,
  clearHoboDataRange,
  setReefPois,
} = selectedReefSlice.actions;

export default selectedReefSlice.reducer;
