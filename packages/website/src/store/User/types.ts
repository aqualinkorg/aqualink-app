import type { Site } from '../Sites/types';

export type AdminLevel = 'default' | 'site_manager' | 'super_admin';

export interface User {
  email?: string | null;
  fullName?: string | null;
  adminLevel?: AdminLevel;
  firebaseUid?: string | null;
  organization?: string | null;
  administeredSites?: Site[];
  collection?: {
    id: number;
    siteIds: number[];
  };
  token?: string | null;
  id: number;
}

export interface UserState {
  userInfo: User | null;
  loading: boolean;
  loadingCollection: boolean;
  error?: string | null;
}

export interface UserRegisterParams {
  fullName: string;
  organization: string;
  email: string;
  password: string;
}

export interface UserSignInParams {
  email: string;
  password: string;
}

export interface PasswordResetParams {
  email: string;
}

export interface CreateUserCollectionRequestParams {
  name: string;
  siteIds: number[];
  token?: string;
  isPublic?: boolean;
}
