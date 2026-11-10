import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import InfoFooter from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(<InfoFooter />);
  expect(container).toMatchSnapshot();
});
