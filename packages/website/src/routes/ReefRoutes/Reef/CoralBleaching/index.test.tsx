import React from "react";
import { render } from "@testing-library/react";

import Bleaching from ".";
import { mockDailyData } from "../../../../mocks/mockDailyData";

test("renders as expected", () => {
  const { container } = render(<Bleaching dailyData={mockDailyData} />);
  expect(container).toMatchSnapshot();
});
