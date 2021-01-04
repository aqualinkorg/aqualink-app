import React from "react";
import { render } from "@testing-library/react";

import UpdateInfo from ".";

test("renders as expected", () => {
  const { container } = render(
    <UpdateInfo
      timestamp="02/01 14:00 EET"
      timestampText="Last data received"
      image={null}
      imageText="NOAA"
      live={false}
      frequency="daily"
    />
  );
  expect(container).toMatchSnapshot();
});
