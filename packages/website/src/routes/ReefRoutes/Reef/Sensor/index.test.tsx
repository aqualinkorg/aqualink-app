import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Sensor from ".";
import type { Reef } from "../../../../store/Reefs/types";

const mockStore = configureStore([]);

const liveData = {
  reef: { id: 1 },
  date: "2020-07-01T14:25:18.008Z",
  bottomTemperature: {
    value: 25,
    timestamp: "2020-07-01T14:25:18.008Z",
  },
  satelliteTemperature: {
    value: 26,
    timestamp: "2020-07-01T14:25:18.008Z",
  },
  degreeHeatingDays: {
    value: 32,
    timestamp: "2020-07-01T14:25:18.008Z",
  },
};

const reef: Reef = {
  id: 16,
  name: "Mock Reef Friesen",
  maxMonthlyMean: 25,
  depth: 24,
  status: 1,
  videoStream: null,
  region: { name: "Hawai" },
  admin: null,
  stream: null,
  liveData,
  polygon: {
    type: "Point",
    coordinates: [0, 0],
  },
  dailyData: [],
  latestDailyData: {
    id: 10,
    date: "",

    minBottomTemperature: 10,
    maxBottomTemperature: 10,
    avgBottomTemperature: 10,

    degreeHeatingDays: 10,
    surfaceTemperature: 10,
    satelliteTemperature: 10,

    minWindSpeed: 10,
    maxWindSpeed: 10,
    avgWindSpeed: 10,
    windDirection: 10,

    minWaveHeight: 10,
    maxWaveHeight: 10,
    avgWaveHeight: 10,
    waveDirection: 10,
    wavePeriod: 10,
  },
};

describe("Sensor Card", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: {
          email: "test@mail.com",
          fullName: "Test User",
          adminLevel: "super_admin",
          firebaseUid: "RaNdOmStRiNg",
          administeredReefs: [],
          token: "RaNdOmStRiNg",
        },
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Sensor reef={reef} />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
