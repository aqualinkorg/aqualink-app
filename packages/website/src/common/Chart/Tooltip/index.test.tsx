import React from "react";
import { render } from "@testing-library/react";

import Tooltip from ".";

test("renders as expected", () => {
  const { container } = render(
    <Tooltip
      reefId={0}
      date="12/20/20, 02:19 AM GMT-5"
      depth={10}
      historicalMonthlyMeanTemp={20}
      satelliteTemp={20}
      spotterTopTemp={10}
      spotterBottomTemp={15}
      hoboBottomTemp={20}
      userTimeZone="UTC"
      reefTimeZone="UTC"
    />
  );
  expect(container).toMatchSnapshot();
});
