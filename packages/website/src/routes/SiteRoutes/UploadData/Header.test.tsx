import React from 'react';
import { render } from '@testing-library/react';
import { mockSite } from 'mocks/mockSite';
import Header from './Header';

test('renders as expected', () => {
  const { container } = render(<Header site={mockSite} />);
  expect(container).toMatchSnapshot();
});
