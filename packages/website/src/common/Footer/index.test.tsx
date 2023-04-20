import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import SiteFooter from '.';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <SiteFooter />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
