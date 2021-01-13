import { LiveData } from "../store/Reefs/types";

const now = new Date();
const minutesAgo = 5;
const liveDataDate = new Date(now.getTime() - minutesAgo * 60000).toISOString();

export const mockLiveData: LiveData = {
  reef: { id: 1 },
  bottomTemperature: {
    value: 25,
    timestamp: liveDataDate,
  },
  satelliteTemperature: {
    value: 26,
    timestamp: liveDataDate,
  },
  degreeHeatingDays: {
    value: 29,
    timestamp: liveDataDate,
  },
  waveHeight: {
    value: 3,
    timestamp: liveDataDate,
  },
  waveDirection: {
    value: 136,
    timestamp: liveDataDate,
  },
  wavePeriod: {
    value: 15,
    timestamp: liveDataDate,
  },
  windSpeed: {
    value: 5,
    timestamp: liveDataDate,
  },
  windDirection: {
    value: 96,
    timestamp: liveDataDate,
  },
};
