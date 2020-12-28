import React from "react";
import { render } from "@testing-library/react";

import UpdateInfo from ".";

test("renders as expected", () => {
  const { container } = render(<UpdateInfo timestamp="" image="" />);
  expect(container).toMatchSnapshot();
});
