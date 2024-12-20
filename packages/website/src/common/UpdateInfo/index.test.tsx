import React from 'react';

import { renderWithProviders } from 'utils/test-utils';
import UpdateInfo from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <UpdateInfo
      relativeTime="02/01 14:00 EET"
      timeText="Last data received"
      image={undefined}
      imageText="NOAA"
      live={false}
      frequency="daily"
    />,
  );
  expect(container).toMatchSnapshot();
});
