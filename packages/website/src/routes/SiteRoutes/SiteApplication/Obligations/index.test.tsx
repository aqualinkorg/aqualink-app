import React from 'react';
import { render } from '@testing-library/react';

import Obligations from '.';

test('Obligations', () => {
  const { container } = render(<Obligations />);
  expect(container).toMatchSnapshot();
});
