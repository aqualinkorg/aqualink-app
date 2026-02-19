import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

rstest.mock('../../routes/Landing', () => 'Mock-LandingPage');
rstest.mock('../../routes/HomeMap', () => 'Mock-HomeMap');
rstest.mock('../../routes/SiteRoutes', () => 'Mock-SiteRoutes');
rstest.mock('../../routes/About', () => 'Mock-About');
rstest.mock('../../routes/RegisterSite', () => 'Mock-RegisterSite');
rstest.mock('../../routes/Buoy', () => 'Mock-Buoy');
rstest.mock('../../routes/Drones', () => 'Mock-Drones');
rstest.mock('../../routes/Faq', () => 'Mock-Faq');
rstest.mock('../../routes/NotFound', () => ({
  NotFound: 'Mock-NotFound',
}));

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Routes>
        <Route path="/" element={<div>LandingPage</div>} />
        <Route path="/map" element={<div>HomeMap</div>} />
        <Route path="/sites" element={<div>Sites</div>} />
        <Route path="*" element={<div>Not Found</div>} />
      </Routes>
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
