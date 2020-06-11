/* eslint-disable camelcase */
export interface Reef {
  id: string;
  regionName: string;
  managerName: string;
  videoStream: string;
}

export interface ReefState {
  details: Reef;
  loading: boolean;
  error?: string | null;
}
