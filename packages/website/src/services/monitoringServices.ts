import requests from 'helpers/requests';
import { Status } from 'store/Sites/types';
import { MonitoringMetric } from 'utils/types';

interface BasicProps {
  token: string;
}

interface PostMonitoringMetricRequestProps {
  token?: string;
  metric: MonitoringMetric;
  siteId: number;
}

const postMonitoringMetric = ({
  token,
  ...rest
}: PostMonitoringMetricRequestProps) =>
  requests.send<void>({
    method: 'POST',
    url: 'monitoring',
    data: {
      ...rest,
    },
    token,
  });

type GetMonitoringMetricsRequestProps = BasicProps & {
  spotterId?: string;
  siteIds?: string[];
  monthly?: boolean;
  start?: string;
  end?: string;
};

export interface MonitoringData {
  date: string;
  totalRequests: number;
  registeredUserRequests: number;
  siteAdminRequests: number;
  timeSeriesRequests: number;
  CSVDownloadRequests: number;
}

export type GetMonitoringMetricsResponse = {
  siteName: string;
  siteId: number;
  data: MonitoringData[];
}[];

const getMonitoringStats = ({
  token,
  ...rest
}: GetMonitoringMetricsRequestProps) =>
  requests.send<GetMonitoringMetricsResponse>({
    method: 'GET',
    url: `monitoring${requests.generateUrlQueryParams(rest)}`,
    token,
  });

type GetMonitoringLastMonthProps = BasicProps;

const getMonitoringLastMonth = ({ token }: GetMonitoringLastMonthProps) =>
  requests.send<GetMonitoringMetricsResponse>({
    method: 'GET',
    url: 'monitoring/last-month',
    token,
  });

type GetSurveysReportProps = BasicProps;

export type GetSurveysReportResponse = {
  diveDate: string;
  siteId: number;
  siteName: string;
  surveyId: number;
  surveyMediaCount: number;
  updatedAt: string;
  userEmail: string;
  userFullName: string;
}[];

const getSurveysReport = ({ token }: GetSurveysReportProps) =>
  requests.send<GetSurveysReportResponse>({
    method: 'GET',
    url: 'monitoring/surveys-report',
    token,
  });

type GetSitesOverviewProps = BasicProps &
  Partial<{
    siteId: number;
    siteName: string;
    spotterId: string;
    adminEmail: string;
    adminUsername: string;
    organization: string;
    status: Status;
  }>;

export type GetSitesOverviewResponse = {
  siteId: number;
  siteName: string;
  depth: number;
  status: Status;
  organizations: string[];
  adminNames: string[];
  adminEmails: string[];
  spotterId: string;
  videoStream: string;
  updatedAt: string;
  lastDataReceived: string | null;
  surveysCount: number;
  contactInformation: string;
  createdAt: string;
}[];

const getSitesOverview = ({ token, ...rest }: GetSitesOverviewProps) =>
  requests.send<GetSitesOverviewResponse>({
    method: 'GET',
    url: `monitoring/sites-overview${requests.generateUrlQueryParams(rest)}`,
    token,
  });

type GetSitesStatusProps = BasicProps;

export interface GetSitesStatusResponse {
  totalSites: number;
  deployed: number;
  displayed: number;
  maintenance: number;
  shipped: number;
  endOfLife: number;
  lost: number;
}

const getSitesStatus = ({ token }: GetSitesStatusProps) =>
  requests.send<GetSitesStatusResponse>({
    method: 'GET',
    url: 'monitoring/sites-status',
    token,
  });

export default {
  postMonitoringMetric,
  getMonitoringStats,
  getMonitoringLastMonth,
  getSurveysReport,
  getSitesOverview,
  getSitesStatus,
};
