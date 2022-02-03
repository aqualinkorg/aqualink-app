import { TimeSeriesDataRange } from "../store/Sites/types";

export const mockDataRange: TimeSeriesDataRange = {
  bottomTemperature: {
    hobo: [
      {
        minDate: "2017-11-02T15:00:00.000Z",
        maxDate: "2020-02-02T21:00:00.000Z",
      },
    ],
  },
  cholorophyllConcentration: {
    sonde: [
      {
        minDate: "2017-11-02T15:00:00.000Z",
        maxDate: "2020-02-02T21:00:00.000Z",
      },
    ],
  },
  odoConcentration: {
    sonde: [
      {
        minDate: "2017-11-02T15:00:00.000Z",
        maxDate: "2020-02-02T21:00:00.000Z",
      },
    ],
  },
  ph: {
    sonde: [
      {
        minDate: "2017-11-02T15:00:00.000Z",
        maxDate: "2020-02-02T21:00:00.000Z",
      },
    ],
  },
  salinity: {
    sonde: [
      {
        minDate: "2017-11-02T15:00:00.000Z",
        maxDate: "2020-02-02T21:00:00.000Z",
      },
    ],
  },
  turbidity: {
    sonde: [
      {
        minDate: "2017-11-02T15:00:00.000Z",
        maxDate: "2020-02-02T21:00:00.000Z",
      },
    ],
  },
};
