import requests from 'helpers/requests';
import { Sources } from 'store/Sites/types';

export interface UploadTimeSeriesResult {
  file: string;
  ignoredHeaders: string[] | null;
  error: string | null;
}

const uploadMedia = (
  formData: FormData,
  siteId: string,
  token?: string | null,
) =>
  requests.send<{
    url: string;
    thumbnailUrl?: string | undefined;
  }>({
    method: 'POST',
    url: `sites/${siteId}/surveys/upload`,
    data: formData,
    token,
    contentType: 'multipart/form-data',
    responseType: 'json',
  });

const uploadMultiSiteTimeSeriesData = (
  files: File[],
  source: Sources,
  siteTimezone: boolean,
  token?: string | null,
  failOnWarning?: boolean,
) => {
  const data = new FormData();
  files.forEach((file) => data.append('files', file));
  data.append('sensor', source);
  if (failOnWarning !== undefined)
    data.append('failOnWarning', String(failOnWarning));
  if (siteTimezone !== undefined)
    data.append('siteTimezone', String(siteTimezone));
  return requests.send<UploadTimeSeriesResult[]>({
    method: 'POST',
    url: `time-series/upload`,
    data,
    token,
    contentType: 'multipart/form-data',
  });
};

const uploadTimeSeriesData = (
  formData: FormData,
  siteId: number,
  pointId: number,
  failOnWarning?: boolean,
  siteTimezone?: boolean,
  token?: string | null,
) =>
  requests.send<UploadTimeSeriesResult[]>({
    method: 'POST',
    url: `time-series/sites/${siteId}/site-survey-points/${pointId}/upload${requests.generateUrlQueryParams(
      { failOnWarning, siteTimezone },
    )}`,
    data: formData,
    token,
    contentType: 'multipart/form-data',
  });

const deleteFileTimeSeriesData = (
  data: { ids: number[] },
  token?: string | null,
) =>
  requests.send<void>({
    method: 'POST',
    url: '/data-uploads/delete-uploads',
    data,
    token,
    contentType: 'application/json',
  });

export default {
  uploadMedia,
  uploadTimeSeriesData,
  deleteFileTimeSeriesData,
  uploadMultiSiteTimeSeriesData,
};
