import requests from 'helpers/requests';

export const getSites = async () =>
  requests.send<{ id: number; name: string | null }[]>({
    url: 'metadata/sites',
    method: 'GET',
  });

export const getSitePoints = async () =>
  requests.send<{ id: number; siteId: number }[]>({
    url: 'metadata/site-points',
    method: 'GET',
  });

export const getSurveys = async () =>
  requests.send<{ id: number; siteId: number }[]>({
    url: 'metadata/surveys',
    method: 'GET',
  });

export const getReefCheckSurveys = async () =>
  requests.send<{ id: string; siteId: number }[]>({
    url: 'metadata/reef-check-surveys',
    method: 'GET',
  });
