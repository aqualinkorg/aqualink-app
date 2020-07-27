import React from "react";
import { render } from "@testing-library/react";

import Popup from ".";
import { Reef } from "../../../../store/Reefs/types";

jest.mock("react-leaflet");

test("renders as expected", () => {
  const reef: Reef = {
    id: 0,
    name: "",
    polygon: {
      coordinates: [0, 0],
      type: "Point",
    },
    temperatureThreshold: 0,
    depth: 0,
    status: 0,
    videoStream: null,
    region: "",
    admin: null,
    stream: null,
    dailyData: [],
  };

  const { container } = render(<Popup reef={reef} />);
  expect(container).toMatchSnapshot();
});
