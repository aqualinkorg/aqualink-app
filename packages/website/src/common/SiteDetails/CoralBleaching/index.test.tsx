import React from 'react';

import { mockTempWeeklyAlert } from 'mocks/mockDailyData';
import { renderWithProviders } from 'utils/test-utils';
import Bleaching from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <Bleaching
      data={{
        tempWeeklyAlert: mockTempWeeklyAlert,
      }}
    />,
  );
  expect(container).toMatchSnapshot();
});

test('does not show a no-alert badge for missing observations', () => {
  const { queryByAltText, getByText } = renderWithProviders(
    <Bleaching data={{}} />,
  );
  expect(queryByAltText('alert-level')).toBeNull();
  expect(getByText('No observations available')).toBeInTheDocument();
});
