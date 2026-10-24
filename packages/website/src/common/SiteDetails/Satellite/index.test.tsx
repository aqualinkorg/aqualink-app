import React from 'react';
import { screen, within } from '@testing-library/react';

import { parseLatestData } from 'store/Sites/helpers';
import { mockLatestData } from 'mocks/mockLatestData';
import { renderWithProviders } from 'utils/test-utils';
import Satellite from '.';

test('renders as expected', () => {
  const data = parseLatestData(mockLatestData);

  const { container } = renderWithProviders(
    <Satellite maxMonthlyMean={24} data={data} />,
  );
  expect(container).toMatchSnapshot();
});

test.each([
  [undefined, '- -'],
  [0, '0.0'],
  [2, '2.0'],
])(
  'preserves a historical heat-stress observation of %s',
  (value, expected) => {
    renderWithProviders(
      <Satellite
        maxMonthlyMean={null}
        historicalDataDate="2024-03-15"
        data={{
          satelliteTemperature: {
            value: 29,
            timestamp: '2024-03-15T00:00:00Z',
          },
          dhw:
            value === undefined
              ? undefined
              : { value, timestamp: '2024-03-15T00:00:00Z' },
        }}
      />,
    );
    const metric = screen.getByText('DEGREE HEATING WEEKS').parentElement!;
    expect(within(metric).getByText(expected)).toBeInTheDocument();
  },
);
