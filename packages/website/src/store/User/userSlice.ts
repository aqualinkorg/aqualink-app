import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import type { AxiosError } from "axios";

import type { User, UserState, UserRequestParams } from "./types";
import type { RootState, CreateAsyncThunkTypes } from "../configure";
import userServices from "../../services/userServices";

const userInitialState: UserState = {
  userInfo: null,
  loading: false,
  error: null,
};

export const createUser = createAsyncThunk<
  User,
  UserRequestParams,
  CreateAsyncThunkTypes
>(
  "user/create",
  async ({ email, password }: UserRequestParams, { rejectWithValue }) => {
    try {
      const { user } = await userServices.createUser(email, password);
      return {
        email: user?.email,
        uid: user?.uid,
        token: await user?.getIdToken(),
      };
    } catch (err) {
      const error: AxiosError<UserState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

export const signInUser = createAsyncThunk<
  User,
  UserRequestParams,
  CreateAsyncThunkTypes
>(
  "user/signIn",
  async ({ email, password }: UserRequestParams, { rejectWithValue }) => {
    try {
      const { user } = await userServices.signInUser(email, password);
      return {
        email: user?.email,
        uid: user?.uid,
        token: await user?.getIdToken(),
      };
    } catch (err) {
      const error: AxiosError<UserState["error"]> = err;
      return rejectWithValue(error.message);
    }
  }
);

export const signOutUser = createAsyncThunk<
  UserState["userInfo"],
  void,
  CreateAsyncThunkTypes
>("user/signOut", async () => {
  try {
    await userServices.signOutUser();
    return null;
  } catch (err) {
    const error: AxiosError<UserState["error"]> = err;
    return Promise.reject(error.message);
  }
});

const userSlice = createSlice({
  name: "user",
  initialState: userInitialState,
  reducers: {},
  extraReducers: (builder) => {
    // User Create
    builder.addCase(
      createUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        return {
          ...state,
          userInfo: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(
      createUser.rejected,
      (state, action: PayloadAction<UserState["error"]>) => {
        return {
          ...state,
          error: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(createUser.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });

    // User Sign In
    builder.addCase(
      signInUser.fulfilled,
      (state, action: PayloadAction<User>) => {
        return {
          ...state,
          userInfo: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(
      signInUser.rejected,
      (_state, action: PayloadAction<UserState["error"]>) => {
        return {
          userInfo: null,
          error: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(signInUser.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });

    // User Sign Out
    builder.addCase(
      signOutUser.fulfilled,
      (state, action: PayloadAction<UserState["userInfo"]>) => {
        return {
          ...state,
          userInfo: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(
      signOutUser.rejected,
      (_state, action: PayloadAction<UserState["error"]>) => {
        return {
          userInfo: null,
          error: action.payload,
          loading: false,
        };
      }
    );

    builder.addCase(signOutUser.pending, (state) => {
      return {
        ...state,
        loading: true,
        error: null,
      };
    });
  },
});

export const userInfoSelector = (state: RootState): UserState["userInfo"] =>
  state.user.userInfo;

export const userLoadingSelector = (state: RootState): UserState["loading"] =>
  state.user.loading;

export const userErrorSelector = (state: RootState): UserState["error"] =>
  state.user.error;

export default userSlice.reducer;
