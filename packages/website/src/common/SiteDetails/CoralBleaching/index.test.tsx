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
