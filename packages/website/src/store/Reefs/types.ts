/* eslint-disable camelcase */
type Position = [number, number];

interface Polygon {
  coordinates: Position[];
  type: string;
}

export interface Reef {
  id: string;
  regionName: string;
  managerName: string;
  videoStream: string;
  polygon: Polygon;
}

export interface ReefState {
  details: Reef;
  loading: boolean;
  error?: string | null;
}
