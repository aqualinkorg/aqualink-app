import React from 'react';
import { render } from '@testing-library/react';

import StatusSnackbar from '.';

test('renders as expected', () => {
  const { container } = render(
    <StatusSnackbar
      open
      message="All good!!"
      severity="success"
      handleClose={jest.fn()}
    />,
  );
  expect(container).toMatchSnapshot();
});
