import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";

import Terms from ".";
import { mockUser } from "../../mocks/mockUser";

const mockStore = configureStore([]);

describe("Terms page", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
    });

    element = render(
      <Provider store={store}>
        <Router>
          <Terms />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
