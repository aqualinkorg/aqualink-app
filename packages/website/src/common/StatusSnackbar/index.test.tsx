import React from 'react';

import { renderWithProviders } from 'utils/test-utils';
import StatusSnackbar from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <StatusSnackbar
      open
      message="All good!!"
      severity="success"
      handleClose={jest.fn()}
    />,
  );
  expect(container).toMatchSnapshot();
});
