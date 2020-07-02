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
  let elementEmpty: HTMLElement;
  let elementFull: HTMLElement;
  beforeEach(() => {
    const emptyStore = mockStore({
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

    const fullStore = mockStore({
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
          dailyData: [
            {
              id: 1,
              date: "20 May 2020",
              reefId: 1,
              bottomTemperature: {
                min: 20,
                max: 30,
                avg: 25,
              },
              degreeHeatingDays: 1,
              surfaceTemperature: 25,
              satelliteTemperature: 26,
              wind: {
                speed: 10,
                minSpeed: 9,
                maxSpeed: 11,
                direction: 180,
              },
              waves: {
                speed: 3,
                minSpeed: 3,
                maxSpeed: 4,
                direction: 180,
                period: 2,
              },
            },
          ],
        },
        loading: false,
        error: null,
      },
    });

    emptyStore.dispatch = jest.fn();
    fullStore.dispatch = jest.fn();

    const mockMatch = {
      isExact: true,
      params: {
        id: "1",
      },
      path: "/reefs/:id",
      url: "/reefs/1",
    };

    elementEmpty = render(
      <Provider store={emptyStore}>
        <Router>
          <Reef match={mockMatch} location={{} as any} history={{} as any} />
        </Router>
      </Provider>
    ).container;

    elementFull = render(
      <Provider store={fullStore}>
        <Router>
          <Reef match={mockMatch} location={{} as any} history={{} as any} />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(elementEmpty).toMatchSnapshot("snapshot-with-no-data");
  });

  it("should render with given state from Redux store", () => {
    expect(elementFull).toMatchSnapshot("snapshot-with-data");
  });
});
