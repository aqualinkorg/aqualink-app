import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Satellite from ".";
import { mockLiveData } from "../../../../mocks/mockLiveData";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <Satellite maxMonthlyMean={24} liveData={mockLiveData} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
