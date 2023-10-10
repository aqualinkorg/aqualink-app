import {
  CollectionDetailsResponse,
  CollectionSummary,
  CollectionUpdateParams,
} from 'store/Collection/types';
import requests from 'helpers/requests';

const createCollection = (
  name: string,
  isPublic: boolean,
  siteIds: number[],
  token?: string,
) =>
  requests.send<CollectionDetailsResponse>({
    method: 'POST',
    url: 'collections',
    token,
    data: { name, isPublic, siteIds },
  });

const getCollections = (token?: string) =>
  requests.send<CollectionSummary[]>({
    method: 'GET',
    url: 'collections',
    token,
  });

const getPublicCollection = (id: number) =>
  requests.send<CollectionDetailsResponse>({
    method: 'GET',
    url: `collections/public/${id}`,
  });

const getHeatStressCollection = () =>
  requests.send<CollectionDetailsResponse>({
    method: 'GET',
    url: 'collections/heat-stress-tracker',
  });

const getCollection = (id: number, token?: string) =>
  requests.send<CollectionDetailsResponse>({
    method: 'GET',
    url: `collections/${id}`,
    token,
  });

const updateCollection = (
  { id, name, addSiteIds, removeSiteIds }: CollectionUpdateParams,
  token?: string,
) =>
  requests.send({
    method: 'PUT',
    url: `collections/${id}`,
    data: { name, addSiteIds, removeSiteIds },
    token,
  });

export default {
  createCollection,
  getCollections,
  getPublicCollection,
  getHeatStressCollection,
  getCollection,
  updateCollection,
};
