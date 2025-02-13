import { render } from '@testing-library/react';
import Component from '.';

test('renders as expected', () => {
  const { container } = render(<Component />);
  expect(container).toMatchSnapshot();
});
