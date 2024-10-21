import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

jest.mock('../../routes/Landing', () => 'Mock-LandingPage');
jest.mock('../../routes/HomeMap', () => 'Mock-HomeMap');
jest.mock('../../routes/SiteRoutes', () => 'Mock-SiteRoutes');
jest.mock('../../routes/About', () => 'Mock-About');
jest.mock('../../routes/RegisterSite', () => 'Mock-RegisterSite');
jest.mock('../../routes/Buoy', () => 'Mock-Buoy');
jest.mock('../../routes/Drones', () => 'Mock-Drones');
jest.mock('../../routes/Faq', () => 'Mock-Faq');
jest.mock('../../routes/NotFound', () => ({
  __esModule: true,
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
