import React from 'react';

import { renderWithProviders } from 'utils/test-utils';
import Form from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <Form siteName="Mock Site" agreed handleFormSubmit={vi.fn()} />,
  );
  expect(container).toMatchSnapshot();
});
