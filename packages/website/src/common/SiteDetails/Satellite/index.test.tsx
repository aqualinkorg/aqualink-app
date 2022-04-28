import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Satellite from ".";
import { latestDataToSofarValue } from "../../../helpers/siteUtils";
import { mockLatestData } from "../../../mocks/mockLatestData";

test("renders as expected", () => {
  const degreeHeating = mockLatestData.find((x) => x.metric === "dhw");
  const satelliteTemperature = mockLatestData.find(
    (x) => x.metric === "satellite_temperature"
  );
  const sstAnomaly = mockLatestData.find((x) => x.metric === "sst_anomaly");
  const data = {
    degreeHeatingDays: latestDataToSofarValue(degreeHeating),
    satelliteTemperature: latestDataToSofarValue(satelliteTemperature),
    sstAnomaly: sstAnomaly?.value,
  };

  const { container } = render(
    <Router>
      <Satellite maxMonthlyMean={24} data={data} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
