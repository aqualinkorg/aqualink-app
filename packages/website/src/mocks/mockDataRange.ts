import { TimeSeriesDataRange } from 'store/Sites/types';

export const mockDataRange: TimeSeriesDataRange = {
  bottomTemperature: {
    hobo: {
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  },
  cholorophyllConcentration: {
    sonde: {
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  },
  odoConcentration: {
    sonde: {
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  },
  ph: {
    sonde: {
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  },
  salinity: {
    sonde: {
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
    hui: {
      data: [
        {
          minDate: '2022-06-11T00:00:00.000Z',
          maxDate: '2022-06-14T23:45:00.000Z',
        },
      ],
    },
  },
  turbidity: {
    sonde: {
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  },
};
