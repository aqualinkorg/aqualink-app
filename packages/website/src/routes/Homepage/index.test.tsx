import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Homepage from ".";

jest.mock("./ReefTable", () => "Mock-ReefTable");

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <Homepage />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
