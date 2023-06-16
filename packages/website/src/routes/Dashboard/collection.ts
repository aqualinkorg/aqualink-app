import { sampleSize } from 'lodash';

import { Site } from 'store/Sites/types';

export const createCollection = (sites: Site[], nSites: number): Collection => {
  const sample = sampleSize(sites, nSites);

  return {
    name: 'My dashboard',
    sites: sample,
  };
};

export interface Collection {
  name: string;
  sites: Site[];
}
