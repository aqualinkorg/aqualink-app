import React from "react";
import { render } from "@testing-library/react";

import Satellite from ".";
import { mockLiveData } from "../../../../mocks/mockLiveData";

test("renders as expected", () => {
  const { container } = render(
    <Satellite maxMonthlyMean={24} liveData={mockLiveData} />
  );
  expect(container).toMatchSnapshot();
});
