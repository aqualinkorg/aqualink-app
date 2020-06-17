import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <Switch>
        <Route exact path="/reefs" render={() => <div>Reefs List</div>} />
        <Route exact path="/reefs/1" render={() => <div>Reefs</div>} />
      </Switch>
    </Router>
  );
  expect(container).toMatchSnapshot();
});
