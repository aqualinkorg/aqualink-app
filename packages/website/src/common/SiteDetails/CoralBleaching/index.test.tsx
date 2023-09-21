import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';

import { dailyDataDate } from 'mocks/mockDailyData';
import Bleaching from '.';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Bleaching
        data={{
          tempWeeklyAlert: { timestamp: dailyDataDate.toString(), value: 3 },
        }}
      />
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
