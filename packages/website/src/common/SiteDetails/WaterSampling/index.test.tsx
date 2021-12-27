import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import WaterSamplingCard from ".";
import { mockHoboDataRange } from "../../../mocks/mockHoboDataRange";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <WaterSamplingCard
        siteId="1"
        pointId="1"
        pointName="Random Point"
        sondeDataRange={mockHoboDataRange.sonde}
      />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
