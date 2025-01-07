import { BrowserRouter as Router } from 'react-router-dom';
import { render } from '@testing-library/react';
import Component from '.';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Component />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
