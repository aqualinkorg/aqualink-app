/* eslint-disable camelcase */
export interface Reef {
  id: string;
  regionName: string;
  managerName: string;
}
export interface ReefState {
  details: Reef;
  loading: boolean;
  error?: string;
}
