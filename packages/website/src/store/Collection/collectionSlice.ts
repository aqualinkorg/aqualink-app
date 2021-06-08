import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import collectionServices from "../../services/collectionServices";
import { CollectionState, CollectionRequestParams } from "./types";
import type { CreateAsyncThunkTypes, RootState } from "../configure";
import { mapCollectionData } from "../Reefs/helpers";

const collectionInitialState: CollectionState = {
  loading: false,
  error: null,
};

export const collectionRequest = createAsyncThunk<
  CollectionState["details"],
  CollectionRequestParams,
  CreateAsyncThunkTypes
>(
  "collection/request",
  async ({ id, isPublic, token }, { rejectWithValue }) => {
    try {
      const { data } = isPublic
        ? await collectionServices.getPublicCollection(id)
        : await collectionServices.getCollection(id, token);
      return {
        ...data,
        reefs: data.reefs.map((item) => ({
          ...item,
          collectionData: mapCollectionData(item.collectionData || {}),
        })),
      };
    } catch (err) {
      const error: AxiosError<CollectionState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

const collectionSlice = createSlice({
  name: "collection",
  initialState: collectionInitialState,
  reducers: {
    clearCollection: (state) => ({ ...state, details: undefined }),
    setName: (state, action: PayloadAction<string>) => ({
      ...state,
      details: state.details
        ? { ...state.details, name: action.payload }
        : state.details,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(
      collectionRequest.fulfilled,
      (state, action: PayloadAction<CollectionState["details"]>) => ({
        ...state,
        details: action.payload,
        loading: false,
      })
    );

    builder.addCase(
      collectionRequest.rejected,
      (state, action: PayloadAction<CollectionState["error"]>) => ({
        ...state,
        loading: false,
        error: action.payload,
      })
    );

    builder.addCase(collectionRequest.pending, (state) => ({
      ...state,
      loading: true,
      error: null,
    }));
  },
});

export const collectionDetailsSelector = (
  state: RootState
): CollectionState["details"] => state.collection.details;

export const collectionLoadingSelector = (
  state: RootState
): CollectionState["loading"] => state.collection.loading;

export const collectionErrorSelector = (
  state: RootState
): CollectionState["error"] => state.collection.error;

export const { clearCollection, setName } = collectionSlice.actions;

export default collectionSlice.reducer;
