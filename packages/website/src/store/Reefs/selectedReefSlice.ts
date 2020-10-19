import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";
import type { ReefUpdateParams, SelectedReefState } from "./types";
import type { RootState, CreateAsyncThunkTypes } from "../configure";
import reefServices from "../../services/reefServices";

const selectedReefInitialState: SelectedReefState = {
  editMode: false,
  loading: false,
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

    return { ...data, dailyData, liveData };
  } catch (err) {
    const error: AxiosError<SelectedReefState["error"]> = err;
    return rejectWithValue(error.message);
  }
});

const selectedReefSlice = createSlice({
  name: "selectedReef",
  initialState: selectedReefInitialState,
  reducers: {
    setEditMode: (state, action: PayloadAction<boolean>) => ({
      ...state,
      editMode: action.payload,
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
  },
});

export const reefDetailsSelector = (
  state: RootState
): SelectedReefState["details"] => state.selectedReef.details;

export const reefEditModeSelector = (
  state: RootState
): SelectedReefState["editMode"] => state.selectedReef.editMode;

export const reefLoadingSelector = (
  state: RootState
): SelectedReefState["loading"] => state.selectedReef.loading;

export const reefErrorSelector = (
  state: RootState
): SelectedReefState["error"] => state.selectedReef.error;

export const {
  setEditMode,
  setSelectedReef,
  setReefData,
} = selectedReefSlice.actions;

export default selectedReefSlice.reducer;
