import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { mockTempWeeklyAlert } from 'mocks/mockDailyData';
import Bleaching from '.';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Bleaching
        data={{
          tempWeeklyAlert: mockTempWeeklyAlert,
        }}
      />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
