import { Site, SiteResponse } from '../Sites/types';
import { User } from '../User/types';

export interface CollectionSummary {
  id: number;
  name: string;
  isPublic: boolean;
  userId: number;
  siteIds: number[];
}

export interface CollectionDetails {
  id: number;
  name: string;
  isPublic: boolean;
  sites: Site[];
  user?: User;
  siteIds: number[];
}

export interface CollectionDetailsResponse extends CollectionDetails {
  sites: SiteResponse[];
}

export interface CollectionRequestParams {
  id?: number;
  isHeatStress?: boolean;
  isPublic?: boolean;
  token?: string;
}

export interface CollectionUpdateParams {
  id: number;
  name?: string;
  addSiteIds?: number[];
  removeSiteIds?: number[];
}

export interface CollectionState {
  details?: CollectionDetails;
  loading: boolean;
  error?: string | null;
}
