import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Bleaching from ".";
import { mockDailyData } from "../../../../mocks/mockDailyData";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <Bleaching dailyData={mockDailyData} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
