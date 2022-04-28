import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";

import Sensor from ".";
import { mockUser } from "../../../mocks/mockUser";
import { mockSite } from "../../../mocks/mockSite";
import { mockLatestData } from "../../../mocks/mockLatestData";
import { latestDataToSofarValue } from "../../../helpers/siteUtils";

const mockStore = configureStore([]);

describe("Sensor Card", () => {
  let element: HTMLElement;

  const topTemperature = mockLatestData.find(
    (x) => x.metric === "top_temperature"
  );
  const bottomTemperature = mockLatestData.find(
    (x) => x.metric === "bottom_temperature"
  );
  const data = {
    topTemperature: latestDataToSofarValue(topTemperature),
    bottomTemperature: latestDataToSofarValue(bottomTemperature),
  };

  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <Sensor depth={mockSite.depth} id={mockSite.id} data={data} />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
