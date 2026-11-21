import React from 'react';

import { parseLatestData } from 'store/Sites/helpers';
import { mockLatestData } from 'mocks/mockLatestData';
import { renderWithProviders } from 'utils/test-utils';
import DissolvedOxygenCard from '.';

const sampleTimestamp = '2026-11-20T12:00:00.000Z';

const readings = {
  odoConcentration: { value: 6.9, timestamp: sampleTimestamp },
  odoSaturation: { value: 111.9, timestamp: sampleTimestamp },
};

test('renders as expected', () => {
  const data = parseLatestData(mockLatestData);

  const { container } = renderWithProviders(
    <DissolvedOxygenCard data={data} />,
  );
  expect(container).toMatchSnapshot();
});

test('shows Good and keeps values opaque when quality is at least 0.7', () => {
  const { getByText, container } = renderWithProviders(
    <DissolvedOxygenCard
      data={{
        ...readings,
        odoQuality: { value: 0.7, timestamp: sampleTimestamp },
      }}
    />,
  );

  expect(getByText('Good (0.70)')).toBeInTheDocument();
  expect(container.querySelector('[style*="opacity: 0.6"]')).toBeNull();
});

test('shows Bad and dims values when quality is below 0.7', () => {
  const { getByText, container } = renderWithProviders(
    <DissolvedOxygenCard
      data={{
        ...readings,
        odoQuality: { value: 0.69, timestamp: sampleTimestamp },
      }}
    />,
  );

  expect(getByText('Bad (0.69)')).toBeInTheDocument();
  expect(container.querySelectorAll('[style*="opacity: 0.6"]')).toHaveLength(2);
});

test('ignores quality when only concentration is present', () => {
  const { queryByText, container } = renderWithProviders(
    <DissolvedOxygenCard
      data={{
        odoConcentration: readings.odoConcentration,
        odoQuality: { value: 0.2, timestamp: sampleTimestamp },
      }}
    />,
  );

  expect(queryByText(/Good|Bad/)).not.toBeInTheDocument();
  expect(container.querySelector('[style*="opacity: 0.6"]')).toBeNull();
});

test('ignores quality when its timestamp differs from the readings', () => {
  const { queryByText, container } = renderWithProviders(
    <DissolvedOxygenCard
      data={{
        ...readings,
        odoQuality: { value: 0.2, timestamp: '2026-11-20T11:00:00.000Z' },
      }}
    />,
  );

  expect(queryByText(/Good|Bad/)).not.toBeInTheDocument();
  expect(container.querySelector('[style*="opacity: 0.6"]')).toBeNull();
});
