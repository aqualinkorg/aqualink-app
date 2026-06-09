import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import { mockSite } from 'mocks/mockSite';
import Header from './Header';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Header site={mockSite} />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
