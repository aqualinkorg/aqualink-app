import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";
import SurveyCard from ".";
import { mockUser } from "../../../../mocks/mockUser";
import { mockSurvey } from "../../../../mocks/mockSurvey";

const mockStore = configureStore([]);

describe("Survey Card", () => {
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
          <SurveyCard
            pointName="Test Point"
            pointId={1}
            isAdmin
            reefId={0}
            survey={mockSurvey}
          />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
