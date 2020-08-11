import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Timeline from ".";

test("renders-as-expected", () => {
  const container = render(
    <Router>
      <Timeline reefId={0} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
