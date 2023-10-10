import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { parseLatestData } from 'store/Sites/helpers';
import { mockLatestData } from 'mocks/mockLatestData';
import Satellite from '.';

test('renders as expected', () => {
  const data = parseLatestData(mockLatestData);

  const { container } = render(
    <Router>
      <Satellite maxMonthlyMean={24} data={data} />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
