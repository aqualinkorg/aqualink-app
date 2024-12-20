import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import SiteFooter from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(<SiteFooter />);
  expect(container).toMatchSnapshot();
});
