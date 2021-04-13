import { LatLngTuple } from "leaflet";

export const collection: Collection = {
  name: "My collection",
  reefs: [
    {
      name: "Ningaloo Coast",
      week: 3.1,
      sst: 3.1,
      historicalMax: 3.1,
      sstAnomaly: 3.1,
      heatStress: 3.1,
      buoySurface: 3.1,
      buoyBottom: 3.1,
      weeklyAlertLevel: 4,
      coords: [-12.167, 130.7829],
    },
    {
      name: "Penguin Cove",
      week: 1.2,
      sst: 1.2,
      historicalMax: 1.2,
      sstAnomaly: 1.2,
      heatStress: 1.2,
      buoySurface: 1.2,
      buoyBottom: 1.2,
      weeklyAlertLevel: 3,
      coords: [-17.306133, 119.312133],
    },
    {
      name: "Pirate Bay",
      week: 3.7,
      sst: 3.7,
      historicalMax: 3.7,
      sstAnomaly: 3.7,
      heatStress: 3.7,
      buoySurface: 3.7,
      buoyBottom: 3.7,
      weeklyAlertLevel: 2,
      coords: [-21.379833, 114.995186],
    },
    {
      name: "Shark Bay",
      week: 3.7,
      sst: 3.7,
      historicalMax: 3.7,
      sstAnomaly: 3.7,
      heatStress: 3.7,
      buoySurface: 3.7,
      buoyBottom: 3.7,
      weeklyAlertLevel: 1,
      coords: [-33.630222438, 115.338463783],
    },
    {
      name: "Montebello Islands",
      week: 3.7,
      sst: 3.7,
      historicalMax: 3.7,
      sstAnomaly: 3.7,
      heatStress: 3.7,
      buoySurface: 3.7,
      buoyBottom: 3.7,
      weeklyAlertLevel: 0,
      coords: [-20.399709, 115.463583],
    },
  ],
};

export interface Collection {
  name: string;
  reefs: {
    name: string;
    week: number;
    sst: number;
    historicalMax: number;
    sstAnomaly: number;
    heatStress: number;
    buoySurface: number;
    buoyBottom: number;
    weeklyAlertLevel: number;
    coords: LatLngTuple;
  }[];
}
