import React from 'react';
import { rstest } from '@rstest/core';

import { renderWithProviders } from 'utils/test-utils';
import Form from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <Form siteName="Mock Site" agreed handleFormSubmit={rstest.fn()} />,
  );
  expect(container).toMatchSnapshot();
});
