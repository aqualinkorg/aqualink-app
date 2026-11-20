import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import Examples from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(<Examples />);
  expect(container).toMatchSnapshot();
});
