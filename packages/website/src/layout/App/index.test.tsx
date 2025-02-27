import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

vi.mock('../../routes/Landing', () => 'Mock-LandingPage');
vi.mock('../../routes/HomeMap', () => 'Mock-HomeMap');
vi.mock('../../routes/SiteRoutes', () => 'Mock-SiteRoutes');
vi.mock('../../routes/About', () => 'Mock-About');
vi.mock('../../routes/RegisterSite', () => 'Mock-RegisterSite');
vi.mock('../../routes/Buoy', () => 'Mock-Buoy');
vi.mock('../../routes/Drones', () => 'Mock-Drones');
vi.mock('../../routes/Faq', () => 'Mock-Faq');
vi.mock('../../routes/NotFound', () => ({
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
