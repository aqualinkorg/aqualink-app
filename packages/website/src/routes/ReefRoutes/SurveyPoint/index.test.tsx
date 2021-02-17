import React from "react";
import { render } from "@testing-library/react";

import SurveyPoint from ".";

test("renders as expected", () => {
  const { container } = render(<SurveyPoint />);
  expect(container).toMatchSnapshot();
});
