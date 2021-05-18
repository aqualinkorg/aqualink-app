import { TimeSeriesDataRange } from "../store/Reefs/types";

export const mockHoboDataRange: TimeSeriesDataRange = {
  hobo: {
    bottomTemperature: [
      {
        minDate: "2017-11-02T15:00:00.000Z",
        maxDate: "2020-02-02T21:00:00.000Z",
      },
    ],
    alert: [],
    dhw: [],
    satelliteTemperature: [],
    topTemperature: [],
    sstAnomaly: [],
    significantWaveHeight: [],
    wavePeakPeriod: [],
    waveMeanDirection: [],
    windSpeed: [],
    windDirection: [],
  },
  spotter: {
    bottomTemperature: [],
    alert: [],
    dhw: [],
    satelliteTemperature: [],
    topTemperature: [],
    sstAnomaly: [],
    significantWaveHeight: [],
    wavePeakPeriod: [],
    waveMeanDirection: [],
    windSpeed: [],
    windDirection: [],
  },
  sofarApi: {
    bottomTemperature: [],
    alert: [],
    dhw: [],
    satelliteTemperature: [],
    topTemperature: [],
    sstAnomaly: [],
    significantWaveHeight: [],
    wavePeakPeriod: [],
    waveMeanDirection: [],
    windSpeed: [],
    windDirection: [],
  },
};
