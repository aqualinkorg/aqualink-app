/* eslint-disable fp/no-mutation */
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";
import Reef from ".";
import { mockReef } from "../../../mocks/mockReef";
import { mockUser } from "../../../mocks/mockUser";
import { mockSurvey } from "../../../mocks/mockSurvey";
import { mockHoboDataRange } from "../../../mocks/mockHoboDataRange";

const mockStore = configureStore([]);

jest.mock("../../../common/SiteDetails/Map", () => "Mock-Map");
jest.mock(
  "../../../common/SiteDetails/FeaturedMedia",
  () => "Mock-FeaturedMedia"
);

jest.mock("../../../common/Chart/ChartWithCard", () => "Mock-ChartWithCard");

jest.mock("react-chartjs-2", () => ({
  Line: () => "Mock-Line",
  Chart: {
    pluginService: {
      register: jest.fn(),
    },
  },
}));

describe("Reef Detail Page", () => {
  let elementEmpty: HTMLElement;
  let elementFull: HTMLElement;
  beforeEach(() => {
    const emptyStore = mockStore({
      selectedReef: {
        details: { ...mockReef, dailyData: [] },
        timeSeriesDataRange: mockHoboDataRange,
        loading: false,
        error: null,
      },
      user: {
        userInfo: mockUser,
        error: null,
        loading: false,
      },
      homepage: {
        reefOnMap: mockReef,
      },
      reefsList: {
        list: [],
        loading: false,
        error: null,
      },
      surveyList: {
        list: [],
        loading: false,
        error: null,
      },
      survey: {
        selectedSurvey: {
          details: null,
        },
      },
    });

    const fullStore = mockStore({
      selectedReef: {
        details: mockReef,
        timeSeriesDataRange: mockHoboDataRange,
        loading: false,
        error: null,
      },
      user: {
        userInfo: mockUser,
        error: null,
        loading: false,
      },
      homepage: {
        reefOnMap: mockReef,
      },
      reefsList: {
        list: [mockReef],
        loading: false,
        error: null,
      },
      surveyList: {
        list: [mockSurvey],
        loading: false,
        error: null,
      },
      survey: {
        selectedSurvey: {
          details: mockSurvey,
        },
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
