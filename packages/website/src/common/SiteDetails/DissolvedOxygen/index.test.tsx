import React from 'react';

import { parseLatestData } from 'store/Sites/helpers';
import { mockLatestData } from 'mocks/mockLatestData';
import { renderWithProviders } from 'utils/test-utils';
import DissolvedOxygenCard from '.';

test('renders as expected', () => {
  const data = parseLatestData(mockLatestData);

  const { container } = renderWithProviders(
    <DissolvedOxygenCard data={data} />,
  );
  expect(container).toMatchSnapshot();
});
