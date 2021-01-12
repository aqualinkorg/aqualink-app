import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import type {
  ReefUpdateParams,
  SelectedReefState,
  SpotterDataRequestParams,
} from "./types";
import type { RootState, CreateAsyncThunkTypes } from "../configure";
import reefServices from "../../services/reefServices";

const selectedReefInitialState: SelectedReefState = {
  draft: null,
  loading: true,
  liveDataLoading: false,
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

    return { ...data, dailyData };
  } catch (err) {
    const error: AxiosError<SelectedReefState["error"]> = err;
    return rejectWithValue(error.message);
  }
});

export const reefLiveDataRequest = createAsyncThunk<
  SelectedReefState["liveData"],
  string,
  CreateAsyncThunkTypes
>("selectedReef/liveDataRequest", async (id: string, { rejectWithValue }) => {
  try {
    const { data } = await reefServices.getReefLiveData(id);
    return data;
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
      reefLiveDataRequest.fulfilled,
      (state, action: PayloadAction<SelectedReefState["liveData"]>) => {
        return {
          ...state,
          liveData: action.payload,
          liveDataLoading: false,
        };
      }
    );

    builder.addCase(
      reefLiveDataRequest.rejected,
      (state, action: PayloadAction<SelectedReefState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          liveDataLoading: false,
        };
      }
    );

    builder.addCase(reefLiveDataRequest.pending, (state) => {
      return {
        ...state,
        liveDataLoading: true,
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
  },
});

export const reefDetailsSelector = (
  state: RootState
): SelectedReefState["details"] => state.selectedReef.details;

export const reefLiveDataSelector = (
  state: RootState
): SelectedReefState["liveData"] => state.selectedReef.liveData;

export const reefSpotterDataSelector = (
  state: RootState
): SelectedReefState["spotterData"] => state.selectedReef.spotterData;

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

export const reefLiveDataLoadingSelector = (
  state: RootState
): SelectedReefState["liveDataLoading"] => state.selectedReef.liveDataLoading;

export const reefErrorSelector = (
  state: RootState
): SelectedReefState["error"] => state.selectedReef.error;

export const {
  setReefDraft,
  setSelectedReef,
  setReefData,
  clearReefSpotterData,
} = selectedReefSlice.actions;

export default selectedReefSlice.reducer;
