import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { uniqBy } from 'lodash';
import { getAxiosErrorMessage } from 'helpers/errors';
import uploadServices, {
  UploadTimeSeriesResult,
} from 'services/uploadServices';
import type { CreateAsyncThunkTypes, RootState } from '../configure';
import { UploadsSliceState } from './types';

const uploadsSliceInitialState: UploadsSliceState = {
  files: [],
  target: undefined,
  uploadInProgress: false,
  uploadResponse: undefined,
  error: undefined,
};

function getErrorFromFileUploadResponse(
  response: UploadTimeSeriesResult[] | undefined,
) {
  const hasError = response?.some((x) => !!x.error);
  const error = response?.reduce((acc, cur) => {
    if (!cur.error) {
      return acc;
    }
    const [maybeFileName, ...maybeFileError] = cur.error.split(': ');
    return {
      ...acc,
      [maybeFileName]: maybeFileError.join(': '),
    };
  }, {});

  return hasError ? error : undefined;
}

export const uploadFiles = createAsyncThunk<
  UploadsSliceState['uploadResponse'],
  string | null | undefined,
  CreateAsyncThunkTypes
>(
  'uploads/uploadFiles',
  async (token: string | null | undefined, { rejectWithValue, getState }) => {
    const state = getState();
    const selectedSensor = state.uploads.target?.selectedSensor;
    const selectedPoint = state.uploads.target?.selectedPoint;
    const siteId = state.uploads.target?.siteId;
    try {
      if (
        typeof siteId === 'number' &&
        typeof selectedPoint === 'number' &&
        selectedSensor
      ) {
        const data = new FormData();
        state.uploads.files.forEach((file) => data.append('files', file));
        data.append('sensor', selectedSensor);
        const { data: uploadResponse } =
          await uploadServices.uploadTimeSeriesData(
            data,
            siteId,
            selectedPoint,
            token,
            false,
          );
        return uploadResponse;
      }
      return rejectWithValue('Invalid arguments');
    } catch (err) {
      const errorMessage = getAxiosErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  },
);

export const uploadMultiSiteFiles = createAsyncThunk<
  UploadsSliceState['uploadResponse'],
  { token: string | null | undefined; files: File[] },
  CreateAsyncThunkTypes
>(
  'uploads/uploadMultiSiteFiles',
  async ({ token, files }, { rejectWithValue }) => {
    try {
      const { data: uploadResponse } =
        await uploadServices.uploadMultiSiteTimeSeriesData(files, token, false);
      return uploadResponse;
    } catch (err) {
      const errorMessage = getAxiosErrorMessage(err);
      return rejectWithValue(errorMessage);
    }
  },
);

const uploadsSlice = createSlice({
  name: 'uploads',
  initialState: uploadsSliceInitialState,
  reducers: {
    addUploadsFiles: (
      state,
      action: PayloadAction<UploadsSliceState['files']>,
    ) => {
      const newFiles = uniqBy([...state.files, ...action.payload], 'name');
      return {
        ...state,
        files: newFiles,
      };
    },
    removeUploadsFiles: (state, action: PayloadAction<string>) => {
      const newFIles = state.files.filter(
        (file) => file.name !== action.payload,
      );
      return {
        ...state,
        files: newFIles,
      };
    },
    clearUploadsFiles: (state) => ({
      ...state,
      files: [],
    }),
    setUploadsTarget: (
      state,
      action: PayloadAction<UploadsSliceState['target']>,
    ) => ({
      ...state,
      target: action.payload,
    }),
    clearUploadsTarget: (state) => ({
      ...state,
      target: undefined,
    }),
    clearUploadsError: (state) => ({
      ...state,
      error: undefined,
    }),
    clearUploadsResponse: (state) => ({
      ...state,
      uploadResponse: undefined,
    }),
  },
  extraReducers: (builder) => {
    builder.addCase(uploadFiles.pending, (state) => {
      return {
        ...state,
        error: undefined,
        uploadInProgress: true,
      };
    });
    builder.addCase(
      uploadFiles.fulfilled,
      (state, action: PayloadAction<UploadsSliceState['uploadResponse']>) => {
        const response = action.payload;
        const error = getErrorFromFileUploadResponse(response);
        return {
          ...state,
          uploadInProgress: false,
          uploadResponse: action.payload,
          error,
        };
      },
    );
    builder.addCase(
      uploadFiles.rejected,
      (state, action: PayloadAction<UploadsSliceState['error']>) => {
        return {
          ...state,
          error: action.payload,
          uploadInProgress: false,
        };
      },
    );

    builder.addCase(uploadMultiSiteFiles.pending, (state) => {
      return {
        ...state,
        error: undefined,
        uploadInProgress: true,
      };
    });
    builder.addCase(
      uploadMultiSiteFiles.fulfilled,
      (state, action: PayloadAction<UploadsSliceState['uploadResponse']>) => {
        const response = action.payload;
        const error = getErrorFromFileUploadResponse(response);
        return {
          ...state,
          uploadInProgress: false,
          uploadResponse: action.payload,
          error,
        };
      },
    );
    builder.addCase(
      uploadMultiSiteFiles.rejected,
      (state, action: PayloadAction<UploadsSliceState['error']>) => {
        return {
          ...state,
          error: action.payload,
          uploadInProgress: false,
        };
      },
    );
  },
});

export const uploadsFilesSelector = (
  state: RootState,
): UploadsSliceState['files'] => state.uploads.files;

export const uploadsTargetSelector = (
  state: RootState,
): UploadsSliceState['target'] => state.uploads.target;

export const uploadsInProgressSelector = (
  state: RootState,
): UploadsSliceState['uploadInProgress'] => state.uploads.uploadInProgress;

export const uploadsResponseSelector = (
  state: RootState,
): UploadsSliceState['uploadResponse'] => state.uploads.uploadResponse;

export const uploadsErrorSelector = (
  state: RootState,
): UploadsSliceState['error'] => state.uploads.error;

export const {
  addUploadsFiles,
  removeUploadsFiles,
  clearUploadsFiles,
  setUploadsTarget,
  clearUploadsTarget,
  clearUploadsError,
  clearUploadsResponse,
} = uploadsSlice.actions;

export default uploadsSlice.reducer;
