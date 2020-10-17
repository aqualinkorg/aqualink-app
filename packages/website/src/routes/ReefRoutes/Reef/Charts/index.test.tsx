import React from "react";
import { render } from "@testing-library/react";

import Charts from ".";
import { mockDailyData } from "../../../../mocks/mockDailyData";

jest.mock("react-chartjs-2", () => ({
  Line: () => "Mock-Line",
  Chart: {
    pluginService: {
      register: jest.fn(),
    },
  },
}));

test("renders as expected", () => {
  const originalError = console.error;
  console.error = jest.fn();
  const { container } = render(
    <Charts
      maxMonthlyMean={null}
      depth={0}
      dailyData={[mockDailyData]}
      surveys={[]}
      temperatureThreshold={0}
    />
  );
  expect(container).toMatchSnapshot();
  console.error = originalError;
});
