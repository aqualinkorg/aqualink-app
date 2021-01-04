import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import Component from ".";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <Component />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
