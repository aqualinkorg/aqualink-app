import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

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
      <Switch>
        <Route exact path="/" component={() => <div>LandingPage</div>} />
        <Route exact path="/map" component={() => <div>HomeMap</div>} />
        <Route path="/sites" component={() => <div>Sites</div>} />
        <Route path="*" component={() => <div>Not Found</div>} />
      </Switch>
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
