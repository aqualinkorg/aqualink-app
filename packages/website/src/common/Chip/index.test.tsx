import { renderWithProviders } from 'utils/test-utils';
import Chip from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(<Chip live />);
  expect(container).toMatchSnapshot();
});
