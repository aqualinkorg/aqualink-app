import { render } from '@testing-library/react';
import AddButton from '.';

test('renders as expected', () => {
  const { container } = render(<AddButton siteId={1} />);
  expect(container).toMatchSnapshot();
});
