import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import Blog from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(<Blog />);
  expect(container).toMatchSnapshot();
});
