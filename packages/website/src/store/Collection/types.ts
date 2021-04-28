import { Reef } from "../Reefs/types";
import { User } from "../User/types";

export interface CollectionSummary {
  id: number;
  name: string;
  isPublic: boolean;
  userId: number;
  reefIds: number[];
}

export interface CollectionDetails {
  id: number;
  name: string;
  isPublic: boolean;
  reefs: Reef[];
  user: User;
  reefIds: number[];
}

export interface CollectionRequestParams {
  id: number;
  isPublic?: boolean;
  token?: string;
}

export interface CollectionUpdateParams {
  id: number;
  name?: string;
  addReefIds?: number[];
  removeReefIds?: number[];
}

export interface CollectionState {
  details?: CollectionDetails;
  loading: boolean;
  error?: string | null;
}
