/* eslint-disable fp/no-mutation */
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";

import Reef from ".";

const mockStore = configureStore([]);

jest.mock("./Map", () => "Mock-Map");
jest.mock("./FeatureVideo", () => "Mock-FeatureVideo");

describe("Reef Detail Page", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      selectedReef: {
        details: {
          id: "1",
          regionName: "Hawai",
          managerName: "Manager",
          videoStream: "",
          polygon: {
            type: "",
            coordinates: [[[0, 0]]],
          },
          dailyData: [],
        },
        loading: false,
        error: null,
      },
    });

    store.dispatch = jest.fn();

    const mockMatch = {
      isExact: true,
      params: {
        id: "1",
      },
      path: "/reefs/:id",
      url: "/reefs/1",
    };

    element = render(
      <Provider store={store}>
        <Router>
          <Reef match={mockMatch} location={{} as any} history={{} as any} />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
