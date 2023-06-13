import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import Waves from '.';
import { mockLatestData } from '../../../mocks/mockLatestData';
import { parseLatestData } from '../../../store/Sites/helpers';

test('renders as expected', () => {
  const data = parseLatestData(mockLatestData);

  const { container } = render(
    <Router>
      <Waves data={data} hasSpotter={false} />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
