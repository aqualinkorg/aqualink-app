import requests from "../helpers/requests";

export interface UploadTimeSeriesResult {
  file: string;
  ignoredHeaders: string[];
}

const uploadMedia = (
  formData: FormData,
  siteId: string,
  token?: string | null
) =>
  requests.send<string>({
    method: "POST",
    url: `sites/${siteId}/surveys/upload`,
    data: formData,
    token,
    contentType: "multipart/form-data",
    responseType: "text",
  });

const uploadTimeSeriesData = (
  formdData: FormData,
  siteId: number,
  pointId: number,
  token?: string | null
) =>
  requests.send<UploadTimeSeriesResult[]>({
    method: "POST",
    url: `time-series/sites/${siteId}/site-survey-points/${pointId}/upload`,
    data: formdData,
    token,
    contentType: "multipart/form-data",
  });

export default { uploadMedia, uploadTimeSeriesData };
