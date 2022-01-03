/* eslint-disable fp/no-mutation */
import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";
import Site from ".";
import { mockSite } from "../../../mocks/mockSite";
import { mockUser } from "../../../mocks/mockUser";
import { mockSurvey } from "../../../mocks/mockSurvey";
import { mockCollection } from "../../../mocks/mockCollection";
import { mockHoboDataRange } from "../../../mocks/mockHoboDataRange";

const mockStore = configureStore([]);

window.scrollTo = jest.fn();

jest.mock("../../../common/SiteDetails/Map", () => "Mock-Map");
jest.mock(
  "../../../common/SiteDetails/FeaturedMedia",
  () => "Mock-FeaturedMedia"
);

jest.mock(
  "../../../common/Chart/MultipleSensorsCharts",
  () => "Mock-MultipleSensorsCharts"
);

jest.mock("react-chartjs-2", () => ({
  Line: () => "Mock-Line",
  Chart: {
    pluginService: {
      register: jest.fn(),
    },
  },
}));

describe("Site Detail Page", () => {
  let elementEmpty: HTMLElement;
  let elementFull: HTMLElement;
  beforeEach(() => {
    const emptyStore = mockStore({
      selectedSite: {
        details: { ...mockSite, dailyData: [] },
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
        siteOnMap: mockSite,
      },
      sitesList: {
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
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    const fullStore = mockStore({
      selectedSite: {
        details: mockSite,
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
        siteOnMap: mockSite,
      },
      sitesList: {
        list: [mockSite],
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
      collection: {
        details: mockCollection,
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
      path: "/sites/:id",
      url: "/sites/1",
    };

    elementEmpty = render(
      <Provider store={emptyStore}>
        <Router>
          <Site match={mockMatch} location={{} as any} history={{} as any} />
        </Router>
      </Provider>
    ).container;

    elementFull = render(
      <Provider store={fullStore}>
        <Router>
          <Site match={mockMatch} location={{} as any} history={{} as any} />
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
