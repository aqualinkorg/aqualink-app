import React from "react";
import { render } from "@testing-library/react";

import Bleaching from ".";

test("renders as expected", () => {
  const maxMonthlyMean = 18;
  const liveData = {
    reef: { id: 1 },
    date: "2020-07-01T14:25:18.008Z",
    bottomTemperature: {
      value: 25,
      timestamp: "2020-07-01T14:25:18.008Z",
    },
    satelliteTemperature: {
      value: 26,
      timestamp: "2020-07-01T14:25:18.008Z",
    },
    degreeHeatingDays: {
      value: 32,
      timestamp: "2020-07-01T14:25:18.008Z",
    },
  };
  const { container } = render(
    <Bleaching liveData={liveData} maxMonthlyMean={maxMonthlyMean} />
  );
  expect(container).toMatchSnapshot();
});
