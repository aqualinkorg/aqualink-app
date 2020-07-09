/* eslint-disable camelcase */
type Position = [number, number];
export interface Polygon {
  coordinates: [Position[]];
  type: "Polygon";
}

export interface Point {
  coordinates: Position;
  type: "Point";
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
  id: number;
  name: string | null;
  polygon: Polygon | Point;
  temperatureThreshold: number | null;
  depth: number | null;
  status: number;
  videoStream: string | null;
  region?: string;
  admin?: string;
  stream?: string;
  dailyData: Data[];
}

export interface ReefsListState {
  list: Reef[];
  loading: boolean;
  error?: string | null;
}

export interface SelectedReefState {
  details: Reef;
  loading: boolean;
  error?: string | null;
}
