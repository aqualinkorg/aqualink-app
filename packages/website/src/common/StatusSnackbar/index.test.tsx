import React from 'react';
import { rstest } from '@rstest/core';

import { renderWithProviders } from 'utils/test-utils';
import StatusSnackbar from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <StatusSnackbar
      open
      message="All good!!"
      severity="success"
      handleClose={rstest.fn()}
    />,
  );
  expect(container).toMatchSnapshot();
});
