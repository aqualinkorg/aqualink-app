import {
  createSlice,
  createAsyncThunk,
  PayloadAction,
  ActionReducerMapBuilder,
  AsyncThunk,
} from '@reduxjs/toolkit';

import { isManager } from 'helpers/user';
import { setSiteNameFromList } from 'helpers/siteUtils';
import { getAxiosErrorMessage, getFirebaseErrorMessage } from 'helpers/errors';
import userServices from 'services/userServices';
import collectionServices from 'services/collectionServices';
import type {
  PasswordResetParams,
  User,
  UserState,
  UserRegisterParams,
  UserSignInParams,
  CreateUserCollectionRequestParams,
} from './types';
import type { RootState, CreateAsyncThunkTypes } from '../configure';
import { constructUserObject } from './helpers';
import { UpdateSiteNameFromListArgs } from '../Sites/types';

const userInitialState: UserState = {
  userInfo: null,
  loading: false,
  loadingCollection: false,
  error: null,
};

export const createUser = createAsyncThunk<
  User,
  UserRegisterParams,
  CreateAsyncThunkTypes
>(
  'user/create',
  async (
    { fullName, email, organization, password }: UserRegisterParams,
    { rejectWithValue },
  ) => {
    let user;
    try {
      // eslint-disable-next-line fp/no-mutation
      user = (await userServices.createUser(email, password))?.user;
      const token = await user?.getIdToken();

      const { data } = await userServices.storeUser(
        fullName,
        email,
        organization,
        token,
      );

      return {
        id: data.id,
        email: data.email,
        fullName: data.fullName,
        organization: data.organization,
        adminLevel: data.adminLevel,
        firebaseUid: data.firebaseUid,
        administeredSites: isManager(data)
          ? (await userServices.getAdministeredSites(token)).data
          : [],
        token: await user?.getIdToken(),
      };
    } catch (err) {
      // Delete the user from Firebase if it exists, then rethrow the error
      await user?.delete();
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

export const signInUser = createAsyncThunk<
  User,
  UserSignInParams,
  CreateAsyncThunkTypes
>(
  'user/signIn',
  async ({ email, password }: UserSignInParams, { rejectWithValue }) => {
    try {
      const { user } = (await userServices.signInUser(email, password)) || {};
      const token = await user?.getIdToken();
      const { data: userData } = await userServices.getSelf(token);
      const { data: collections } =
        await collectionServices.getCollections(token);
      return constructUserObject(userData, collections, token);
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

export const resetPassword = createAsyncThunk<
  PasswordResetParams,
  PasswordResetParams,
  CreateAsyncThunkTypes
>('user/reset', async ({ email }: PasswordResetParams, { rejectWithValue }) => {
  try {
    await userServices.resetPassword(email);
    return { email };
  } catch (err) {
    return rejectWithValue(getAxiosErrorMessage(err));
  }
});

export const getSelf = createAsyncThunk<User, string, CreateAsyncThunkTypes>(
  'user/getSelf',
  async (token: string, { rejectWithValue }) => {
    try {
      const { data: userData } = await userServices.getSelf(token);
      const { data: collections } =
        await collectionServices.getCollections(token);
      return constructUserObject(userData, collections, token);
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
  {
    // If another user action is pending, cancel this request before it starts.
    condition(arg: string, { getState }) {
      const {
        user: { loading },
      } = getState();
      return !loading;
    },
  },
);

export const signOutUser = createAsyncThunk<
  UserState['userInfo'],
  void,
  CreateAsyncThunkTypes
>('user/signOut', async () => {
  try {
    await userServices.signOutUser();
    return null;
  } catch (err) {
    return Promise.reject(getFirebaseErrorMessage(err));
  }
});

export const createCollectionRequest = createAsyncThunk<
  UserState['userInfo'],
  CreateUserCollectionRequestParams,
  CreateAsyncThunkTypes
>(
  'user/createRequest',
  async ({ name, isPublic, siteIds, token }, { rejectWithValue, getState }) => {
    const state = getState();
    const { userInfo } = state.user;
    try {
      const { data } = await collectionServices.createCollection(
        name,
        isPublic || false,
        siteIds,
        token,
      );
      return userInfo === null
        ? null
        : {
            ...userInfo,
            collection: { id: data.id, siteIds: data.siteIds },
          };
    } catch (err) {
      return rejectWithValue(getAxiosErrorMessage(err));
    }
  },
);

function addAsyncReducer<Out, In, ThunkParams extends CreateAsyncThunkTypes>(
  builder: ActionReducerMapBuilder<UserState>,
  thunk: AsyncThunk<Out, In, ThunkParams>,
  // there's no easy way (I know of) to take a type - UserState - and make everything in it optional
  rejected: (action: PayloadAction<UserState['error']>) => UserState | any = (
    action,
  ) => ({
    userInfo: null,
    error: action.payload,
    loading: false,
  }),
  fulfilled: (action: PayloadAction<Out>) => UserState | any = (action) => ({
    userInfo: action.payload,
    loading: false,
  }),
) {
  builder.addCase(thunk.fulfilled, (state, action: PayloadAction<Out>) => ({
    ...state,
    ...fulfilled(action),
  }));
  builder.addCase(
    thunk.rejected,
    (state, action: PayloadAction<UserState['error']>) => ({
      ...state,
      ...rejected(action),
    }),
  );
  builder.addCase(thunk.pending, (state) => ({
    ...state,
    loading: true,
    error: null,
  }));
}

const userSlice = createSlice({
  name: 'user',
  initialState: userInitialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      if (state.userInfo) {
        return {
          ...state,
          userInfo: {
            ...state.userInfo,
            token: action.payload,
          },
        };
      }
      return state;
    },
    clearError: (state) => ({ ...state, error: null }),
    setCollectionSites: (state, action: PayloadAction<number[]>) => ({
      ...state,
      userInfo: state.userInfo
        ? {
            ...state.userInfo,
            collection: state.userInfo.collection
              ? { ...state.userInfo.collection, siteIds: action.payload }
              : state.userInfo.collection,
          }
        : state.userInfo,
    }),
    setAdministeredSiteName: (
      state,
      action: PayloadAction<UpdateSiteNameFromListArgs>,
    ) => ({
      ...state,
      userInfo: state.userInfo
        ? {
            ...state.userInfo,
            administeredSites: setSiteNameFromList(action.payload),
          }
        : state.userInfo,
    }),
  },
  extraReducers: (builder) => {
    // User Create
    addAsyncReducer(builder, createUser, (action) => ({
      error: action.payload,
      loading: false,
    }));
    // User Sign In
    addAsyncReducer(builder, signInUser);
    // User Sign Out
    addAsyncReducer(builder, signOutUser);
    // Get self
    addAsyncReducer(builder, getSelf, (action) => ({
      error: action.payload,
      loading: false,
    }));

    builder.addCase(
      createCollectionRequest.fulfilled,
      (state, action: PayloadAction<UserState['userInfo']>) => ({
        ...state,
        userInfo: action.payload,
        loadingCollection: false,
      }),
    );

    builder.addCase(
      createCollectionRequest.rejected,
      (state, action: PayloadAction<UserState['error']>) => ({
        ...state,
        error: action.payload,
        loadingCollection: false,
      }),
    );

    builder.addCase(createCollectionRequest.pending, (state) => ({
      ...state,
      loadingCollection: true,
      error: null,
    }));
  },
});

export const userInfoSelector = (state: RootState): UserState['userInfo'] =>
  state.user.userInfo;

export const userLoadingSelector = (state: RootState): UserState['loading'] =>
  state.user.loading;

export const userCollectionLoadingSelector = (
  state: RootState,
): UserState['loadingCollection'] => state.user.loadingCollection;

export const userErrorSelector = (state: RootState): UserState['error'] =>
  state.user.error;

export const {
  setToken,
  clearError,
  setCollectionSites,
  setAdministeredSiteName,
} = userSlice.actions;

export default userSlice.reducer;
