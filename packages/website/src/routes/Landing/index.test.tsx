import React from "react";
import { render } from "@testing-library/react";

import LandingPage from ".";

test("renders as expected", () => {
  const { container } = render(<LandingPage />);
  expect(container).toMatchSnapshot();
});
