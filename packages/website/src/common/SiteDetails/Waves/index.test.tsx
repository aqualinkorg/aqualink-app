import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";

import Waves from ".";
import { mockLiveData } from "../../../mocks/mockLiveData";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <Waves liveData={mockLiveData} />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
