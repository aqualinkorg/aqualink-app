import React from 'react';
import { render } from '@testing-library/react';

import Form from '.';

jest.mock('@material-ui/pickers', () => ({
  __esModule: true,
  KeyboardDatePicker: 'mock-KeyboardDatePicker',
  KeyboardDatePickerProps: 'mock-KeyboardDatePickerProps',
  MuiPickersUtilsProvider: 'mock-MuiPickersUtilsProvider',
}));

test('renders as expected', () => {
  const { container } = render(
    <Form siteName="Mock Site" agreed handleFormSubmit={jest.fn()} />,
  );
  expect(container).toMatchSnapshot();
});
