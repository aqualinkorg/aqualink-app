import React from 'react';
import { render } from '@testing-library/react';

import RouteButtons from '.';

test('renders as expected', () => {
  const { container } = render(<RouteButtons />);
  expect(container).toMatchSnapshot();
});
