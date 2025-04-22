import requests from 'helpers/requests';
import { ReefCheckSurvey } from 'store/ReefCheckSurveys/types';

export const getReefCheckSurvey = async (siteId: string, id: string) =>
  requests.send<ReefCheckSurvey>({
    url: `reef-check-sites/${encodeURIComponent(
      siteId,
    )}/surveys/${encodeURIComponent(id)}`,
    method: 'GET',
  });

export const getReefCheckSurveys = async (siteId: number) =>
  requests.send<ReefCheckSurvey[]>({
    url: `reef-check-sites/${encodeURIComponent(siteId)}/surveys`,
    method: 'GET',
  });
