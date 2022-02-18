import React from "react";
import { render } from "@testing-library/react";

import Tooltip from ".";
import { Dataset } from "..";

const mockDataset: Dataset = {
  label: "MOCK DATASET",
  data: [{ timestamp: "2021-02-17T13:00:00.000Z", value: 10 }],
  curveColor: "red",
  type: "line",
  unit: "°C",
  displayData: true,
  tooltipLabel: "MOCK LOGGER",
  tooltipMaxHoursGap: 6,
};

test("renders as expected", () => {
  const { container } = render(
    <Tooltip
      siteId={0}
      date="12/20/20, 02:19 AM GMT-5"
      datasets={[mockDataset]}
      userTimeZone="UTC"
      siteTimeZone="UTC"
    />
  );
  expect(container).toMatchSnapshot();
});
