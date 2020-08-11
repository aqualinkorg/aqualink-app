import React from "react";
import { render } from "@testing-library/react";

import Surveys from ".";

test("renders-as-expected", () => {
  const container = render(<Surveys />);
  expect(container).toMatchSnapshot();
});
