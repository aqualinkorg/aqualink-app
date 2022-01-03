import React from "react";
import { render } from "@testing-library/react";

import LoadingCard from ".";

test("renders as expected", () => {
  const { container } = render(<LoadingCard />);
  expect(container).toMatchSnapshot();
});
