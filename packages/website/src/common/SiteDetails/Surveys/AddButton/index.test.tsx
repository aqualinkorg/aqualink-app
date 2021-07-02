import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import AddButton from ".";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <AddButton reefId={1} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
