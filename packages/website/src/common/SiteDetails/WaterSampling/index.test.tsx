import React from 'react';

import { renderWithProviders } from 'utils/test-utils';
import WaterSamplingCard from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <WaterSamplingCard siteId="1" source="sonde" />,
  );
  expect(container).toMatchSnapshot();
});
