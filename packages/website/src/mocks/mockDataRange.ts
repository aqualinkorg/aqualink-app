import { TimeSeriesDataRange } from 'store/Sites/types';

export const mockDataRange: TimeSeriesDataRange = {
  bottomTemperature: [
    {
      type: 'hobo',
      depth: null,
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  ],
  cholorophyllConcentration: [
    {
      type: 'sonde',
      depth: null,
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  ],
  odoConcentration: [
    {
      type: 'sonde',
      depth: null,
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  ],
  ph: [
    {
      type: 'sonde',
      depth: null,
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  ],
  salinity: [
    {
      type: 'sonde',
      depth: null,
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
    {
      type: 'hui',
      depth: null,
      data: [
        {
          minDate: '2022-06-11T00:00:00.000Z',
          maxDate: '2022-06-14T23:45:00.000Z',
        },
      ],
    },
  ],
  turbidity: [
    {
      type: 'sonde',
      depth: null,
      data: [
        {
          minDate: '2017-11-02T15:00:00.000Z',
          maxDate: '2020-02-02T21:00:00.000Z',
        },
      ],
    },
  ],
};
