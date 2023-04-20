import { CollectionDetails, CollectionDetailsResponse } from './types';

export const constructCollection = (
  data: CollectionDetailsResponse,
): CollectionDetails => ({
  ...data,
  sites: data.sites.map((item) => ({
    ...item,
    collectionData: item.collectionData || {},
  })),
});
