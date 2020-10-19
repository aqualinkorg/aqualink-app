/* eslint-disable no-underscore-dangle */
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";

import Map from ".";

jest.mock("react-leaflet");

const mockStore = configureStore([]);

test("renders as expected", () => {
  const { container } = render(
    <Provider store={mockStore({ selectedReef: { editMode: false } })}>
      <Map
        polygon={{
          type: "Polygon",
          coordinates: [[[0, 0]]],
        }}
      />
    </Provider>
  );
  expect(container).toMatchSnapshot();
});
