import { renderWithProviders } from 'utils/test-utils';
import CardWithTitle from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <CardWithTitle
      titleItems={[
        {
          text: 'Some value',
          variant: 'h6',
          marginRight: '1rem',
        },
      ]}
      loading={false}
      gridProps={{ xs: 12 }}
    />,
  );
  expect(container).toMatchSnapshot();
});
