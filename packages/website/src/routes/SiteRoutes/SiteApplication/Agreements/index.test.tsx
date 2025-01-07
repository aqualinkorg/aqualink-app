import { render } from '@testing-library/react';

import Agreements from '.';
import { AgreementsChecked } from '../types';

const handleChange = jest.fn();
const agreementsChecked: AgreementsChecked = {
  buoy: false,
  shipping: true,
  survey: true,
};

test('renders as expected', () => {
  const { container } = render(
    <Agreements
      handleChange={handleChange}
      agreementsChecked={agreementsChecked}
    />,
  );
  expect(container).toMatchSnapshot();
});
