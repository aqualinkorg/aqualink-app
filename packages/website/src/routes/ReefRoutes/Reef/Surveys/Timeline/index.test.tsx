import React from "react";
import { render } from "@testing-library/react";

import Timeline from ".";

test("renders-as-expected", () => {
  const container = render(<Timeline />);
  expect(container).toMatchSnapshot();
});
