import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";
import SiteNavBar from ".";

import { mockSite } from "../../../../mocks/mockSite";
import { mockUser } from "../../../../mocks/mockUser";

const mockStore = configureStore([]);

describe("SiteNavBar", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      sitesList: {
        list: [mockSite],
      },
    });
    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <SiteNavBar
            hasDailyData
            site={mockSite}
            isAdmin
            lastSurvey="2020-09-10T10:27:00.000Z"
          />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
