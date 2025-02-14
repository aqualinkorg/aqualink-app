import { parseLatestData } from 'store/Sites/helpers';
import { mockLatestData } from 'mocks/mockLatestData';
import { renderWithProviders } from 'utils/test-utils';
import Satellite from '.';

test('renders as expected', () => {
  const data = parseLatestData(mockLatestData);

  const { container } = renderWithProviders(
    <Satellite maxMonthlyMean={24} data={data} />,
  );
  expect(container).toMatchSnapshot();
});
