import { UploadTimeSeriesResult } from 'services/uploadServices';
import { Sources } from '../Sites/types';

export interface UploadsSliceState {
  files: File[];
  target?: {
    selectedSensor: Sources;
    selectedPoint: number;
    useSiteTimezone: boolean;
    siteId: number;
  };
  uploadInProgress: boolean;
  uploadResponse?: UploadTimeSeriesResult[];
  error?: any;
}
