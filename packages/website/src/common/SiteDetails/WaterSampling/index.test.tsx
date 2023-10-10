import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import WaterSamplingCard from '.';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <WaterSamplingCard siteId="1" source="sonde" />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
