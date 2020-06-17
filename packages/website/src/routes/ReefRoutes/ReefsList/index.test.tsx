import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import ReefsList from ".";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <ReefsList />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
