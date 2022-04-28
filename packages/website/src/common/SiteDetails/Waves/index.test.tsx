import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Waves from ".";
import { mockLatestData } from "../../../mocks/mockLatestData";
import { latestDataToSofarValue } from "../../../helpers/siteUtils";

test("renders as expected", () => {
  const topTemperature = mockLatestData.find(
    (x) => x.metric === "top_temperature"
  );
  const bottomTemperature = mockLatestData.find(
    (x) => x.metric === "bottom_temperature"
  );
  const waveHeight = mockLatestData.find(
    (x) => x.metric === "significant_wave_height"
  ); // not sure if here 'significant_wave_height' is the one
  const waveMeanDirection = mockLatestData.find(
    (x) => x.metric === "wave_mean_direction"
  );
  const waveMeanPeriod = mockLatestData.find(
    (x) => x.metric === "wave_mean_period"
  );
  const windSpeed = mockLatestData.find((x) => x.metric === "wind_speed");
  const windDirection = mockLatestData.find(
    (x) => x.metric === "wind_direction"
  );
  const data = {
    topTemperature: latestDataToSofarValue(topTemperature),
    bottomTemperature: latestDataToSofarValue(bottomTemperature),
    waveHeight: latestDataToSofarValue(waveHeight),
    waveMeanDirection: latestDataToSofarValue(waveMeanDirection),
    waveMeanPeriod: latestDataToSofarValue(waveMeanPeriod),
    windSpeed: latestDataToSofarValue(windSpeed),
    windDirection: latestDataToSofarValue(windDirection),
  };

  const { container } = render(
    <Router>
      <Waves data={data} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
