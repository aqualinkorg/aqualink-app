import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";

import Sensor from ".";
import { mockUser } from "../../../mocks/mockUser";
import { mockSite } from "../../../mocks/mockSite";
import { mockLiveData } from "../../../mocks/mockLiveData";

const mockStore = configureStore([]);

describe("Sensor Card", () => {
  let element: HTMLElement;
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
          <Sensor
            depth={mockSite.depth}
            id={mockSite.id}
            liveData={mockLiveData}
          />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
