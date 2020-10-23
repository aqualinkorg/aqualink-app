import React from "react";
import { render } from "@testing-library/react";

import Waves from ".";
import { mockLiveData } from "../../../../mocks/mockLiveData";

test("renders as expected", () => {
  const { container } = render(<Waves liveData={mockLiveData} />);
  expect(container).toMatchSnapshot();
});
