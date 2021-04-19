import type { Reef } from "../Reefs/types";

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
  userId: number;
  reefIds: number[];
}

export interface User {
  email?: string | null;
  fullName?: string | null;
  adminLevel?: "default" | "reef_manager" | "super_admin";
  firebaseUid?: string | null;
  organization?: string | null;
  administeredReefs?: Reef[];
  collection?: CollectionDetails;
  token?: string | null;
  id: number;
}

export interface UserState {
  userInfo: User | null;
  loading: boolean;
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
