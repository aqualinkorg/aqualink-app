import React from "react";
import { render } from "@testing-library/react";

import HomePageNavBar from ".";

test("renders as expected", () => {
  const { container } = render(<HomePageNavBar />);
  expect(container).toMatchSnapshot();
});
