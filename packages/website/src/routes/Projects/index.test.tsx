import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import Projects from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(<Projects />);
  expect(container).toMatchSnapshot();
});
