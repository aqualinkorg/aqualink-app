/* eslint-disable no-underscore-dangle */
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";

import Map from ".";
import { mockUser } from "../../../mocks/mockUser";

jest.mock("react-leaflet");

const mockStore = configureStore([]);

describe("Reef Map", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      selectedReef: {
        draft: null,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Map
          polygon={{
            type: "Polygon",
            coordinates: [[[0, 0]]],
          }}
        />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
