import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import { BrowserRouter as Router } from "react-router-dom";
import { mockUser } from "../../mocks/mockUser";

import Homepage from ".";

jest.mock("../../common/NavBar", () => "Mock-NavBar");
jest.mock("./Map", () => "Mock-Map");
jest.mock("./ReefTable", () => "Mock-ReefTable");

const mockStore = configureStore([]);
describe("Homepage", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      reefsList: {
        list: [],
        loading: false,
        error: null,
      },
      homepage: {
        reefOnMap: null,
      },
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <Homepage />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
