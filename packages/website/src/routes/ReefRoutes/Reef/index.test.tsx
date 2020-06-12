import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router, Route } from "react-router-dom";

import Reef from ".";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <Route exact path="/reefs/1" component={Reef} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
