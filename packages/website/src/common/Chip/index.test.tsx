import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import Chip from '.';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Chip live />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
