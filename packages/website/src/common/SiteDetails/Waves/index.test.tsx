import React from 'react';

import { parseLatestData } from 'store/Sites/helpers';
import { mockLatestData } from 'mocks/mockLatestData';
import { renderWithProviders } from 'utils/test-utils';
import Waves from '.';

test('renders as expected', () => {
  const data = parseLatestData(mockLatestData);

  const { container } = renderWithProviders(<Waves data={data} />);
  expect(container).toMatchSnapshot();
});
