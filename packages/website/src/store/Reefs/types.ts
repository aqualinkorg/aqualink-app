/* eslint-disable camelcase */
export interface Reef {
  id: string;
  region_name: string;
  manager_name: string;
}
export interface ReefState {
  details: Reef;
  loading: boolean;
  error?: string;
}
