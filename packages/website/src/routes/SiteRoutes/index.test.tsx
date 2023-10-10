import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';

test('renders as expected', () => {
  const { container } = render(
    <Router>
      <Switch>
        <Route exact path="/sites" render={() => <div>Sites List</div>} />
        <Route exact path="/sites/1" render={() => <div>Sites</div>} />
      </Switch>
    </Router>,
  );
  expect(container).toMatchSnapshot();
});
