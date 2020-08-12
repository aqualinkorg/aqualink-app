import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Surveys from ".";

test("renders-as-expected", () => {
  const container = render(
    <Router>
      <Surveys user addNew={false} reefId={0} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
