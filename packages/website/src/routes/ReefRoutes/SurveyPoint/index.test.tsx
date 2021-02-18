import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import { mockReef } from "../../../mocks/mockReef";
import { mockUser } from "../../../mocks/mockUser";

import SurveyPoint from ".";
import { mockSurvey } from "../../../mocks/mockSurvey";

jest.mock("./InfoCard/Map", () => "Mock-Map");

const mockMatch = {
  isExact: true,
  params: {
    id: "1",
    pointId: "1",
  },
  path: "/reefs/:id/points/:pointId",
  url: "/reefs/1/points/1",
};

const mockStore = configureStore([]);

describe("Survey Point Detail Page", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      selectedReef: {
        details: mockReef,
        loading: false,
        error: null,
      },
      reefsList: {
        list: [mockReef],
        loading: false,
        error: null,
      },
      user: {
        userInfo: mockUser,
        error: null,
        loading: false,
      },
      surveyList: {
        list: [mockSurvey],
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <SurveyPoint
            match={mockMatch}
            location={{} as any}
            history={{} as any}
          />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot("snapshot");
  });
});
