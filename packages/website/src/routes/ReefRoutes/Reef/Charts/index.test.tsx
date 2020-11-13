import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import Charts from ".";
import { mockDailyData } from "../../../../mocks/mockDailyData";
import { mockSurvey } from "../../../../mocks/mockSurvey";

const mockStore = configureStore([]);

jest.mock("react-chartjs-2", () => ({
  Line: () => "Mock-Line",
  Chart: {
    pluginService: {
      register: jest.fn(),
    },
  },
}));

describe("Charts", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      survey: {
        selectedSurvey: {
          details: mockSurvey,
        },
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Charts
          title="Test Chart"
          reefId={1}
          background
          maxMonthlyMean={null}
          depth={0}
          dailyData={[mockDailyData]}
          surveys={[]}
          temperatureThreshold={0}
        />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
