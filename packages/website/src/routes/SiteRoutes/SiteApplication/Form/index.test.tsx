import React from 'react';
import { render } from '@testing-library/react';

import Form from '.';

test('renders as expected', () => {
  const { container } = render(
    <Form siteName="Mock Site" agreed handleFormSubmit={jest.fn()} />,
  );
  expect(container).toMatchSnapshot();
});
