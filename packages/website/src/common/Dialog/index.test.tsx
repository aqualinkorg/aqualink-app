import { renderWithProviders } from 'utils/test-utils';
import Dialog from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <Dialog
      open
      onClose={() => {}}
      header="Random Header"
      content={<div>Some random content</div>}
      actions={[]}
    />,
  );
  expect(container).toMatchSnapshot();
});
