import { sortBy } from "lodash";
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { AxiosError } from "axios";

import { ReefsListState, OrderParams } from "./types";

import type { RootState, CreateAsyncThunkTypes } from "../configure";
import reefServices from "../../services/reefServices";

const reefsListInitialState: ReefsListState = {
  list: [],
  orderedList: [],
  loading: false,
  error: null,
};

const getReefs = async () => {
  try {
    const { data } = await reefServices.getReefs();
    return sortBy(data, "name");
  } catch (err) {
    const error: AxiosError<ReefsListState["error"]> = err;
    return Promise.reject(error.message);
  }
};

export const reefsRequest = createAsyncThunk<
  ReefsListState["list"],
  void,
  CreateAsyncThunkTypes
>("reefsList/request", () => getReefs());

const reefsListSlice = createSlice({
  name: "reefsList",
  initialState: reefsListInitialState,
  reducers: {
    orderList: (state, action: PayloadAction<OrderParams>) => {
      switch (action.payload.orderBy) {
        case -1:
          return {
            ...state,
            orderedList: state.list,
          };
        default:
          return state;
      }
    },
  },
  extraReducers: (builder) => {
    builder.addCase(
      reefsRequest.fulfilled,
      (state, action: PayloadAction<ReefsListState["list"]>) => {
        return {
          ...state,
          list: action.payload,
          orderedList: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(reefsRequest.rejected, (state, action) => {
      return {
        ...state,
        error: action.error.message
          ? action.error.message
          : action.error.toString(),
        loading: false,
      };
    });

    builder.addCase(reefsRequest.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });
  },
});

export const reefsListSelector = (state: RootState): ReefsListState["list"] =>
  state.reefsList.list;

export const reefOrderedListSelector = (
  state: RootState
): ReefsListState["orderedList"] => state.reefsList.orderedList;

export const reefsListLoadingSelector = (
  state: RootState
): ReefsListState["loading"] => state.reefsList.loading;

export const reefsListErrorSelector = (
  state: RootState
): ReefsListState["error"] => state.reefsList.error;

export const { orderList } = reefsListSlice.actions;

export default reefsListSlice.reducer;
