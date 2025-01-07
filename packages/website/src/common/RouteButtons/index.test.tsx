import { render } from '@testing-library/react';

import { BrowserRouter } from 'react-router-dom';
import RouteButtons from '.';

test('renders as expected', () => {
  const { container } = render(
    <BrowserRouter>
      <RouteButtons />
    </BrowserRouter>,
  );
  expect(container).toMatchSnapshot();
});
