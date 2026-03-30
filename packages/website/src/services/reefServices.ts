import requests from "./requests";

const getSitesList = () => requests.get<any[]>("/sites");

/**
 * Fetch the sites list along with their daily data for a specific historical date.
 * The API receives the date as an ISO string and returns SST, bleaching alerts, etc.
 * for the requested date instead of the most recent data.
 *
 * @param date - ISO 8601 date string (e.g. "2020-03-15T00:00:00.000Z")
 */
const getSitesWithDailyData = (date: string) =>
  requests.get<any[]>("/sites", { params: { date } });

const getSite = (id: number) => requests.get<any>(`/sites/${id}`);

const getSitePointsOfInterest = (siteId: number) =>
  requests.get<any[]>(`/sites/${siteId}/poi`);

const getSiteDailyData = (id: number, start?: string, end?: string) =>
  requests.get<any[]>(`/sites/${id}/daily_data`, {
    params: { start, end },
  });

const getSiteTimeSeriesData = (
  id: number,
  start?: string,
  end?: string,
  metrics?: string[]
) =>
  requests.get<any>(`/sites/${id}/time_series`, {
    params: { start, end, metrics },
  });

const getSiteLiveData = (id: number) =>
  requests.get<any>(`/sites/${id}/live_data`);

export default {
  getSitesList,
  getSitesWithDailyData,
  getSite,
  getSitePointsOfInterest,
  getSiteDailyData,
  getSiteTimeSeriesData,
  getSiteLiveData,
};
