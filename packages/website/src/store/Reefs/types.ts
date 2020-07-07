/* eslint-disable camelcase */
type Position = [number, number];

interface Polygon {
  coordinates: [Position[]];
  type: string;
}

export interface Data {
  id: number;
  date: "string";
  reefId: number;
  bottomTemperature: {
    min: number;
    max: number;
    avg: number;
  };
  degreeHeatingDays: number;
  surfaceTemperature: number;
  satelliteTemperature: number;
  wind: {
    speed: number;
    minSpeed: number;
    maxSpeed: number;
    direction: number;
  };
  waves: {
    speed: number;
    minSpeed: number;
    maxSpeed: number;
    direction: number;
    period: number;
  };
}

export interface Reef {
  id: string;
  regionName: string;
  managerName: string;
  videoStream: string;
  polygon: Polygon;
  dailyData: Data[];
}

export interface ReefState {
  details: Reef;
  loading: boolean;
  error?: string | null;
}
