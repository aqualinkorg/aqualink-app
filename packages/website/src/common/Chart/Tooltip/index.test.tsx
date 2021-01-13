import React from "react";
import { render } from "@testing-library/react";

import Tooltip from ".";

test("renders as expected", () => {
  const { container } = render(
    <Tooltip
      reefId={0}
      date="12/20/20, 02:19 AM GMT-5"
      depth={10}
      spotterSurfaceTemp={20}
      bottomTemperature={15}
      surfaceTemperature={20}
    />
  );
  expect(container).toMatchSnapshot();
});
