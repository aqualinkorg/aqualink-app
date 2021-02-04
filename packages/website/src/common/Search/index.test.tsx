import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter as Router } from "react-router-dom";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";

import Search from ".";
import { mockReef } from "../../mocks/mockReef";

const mockStore = configureStore([]);

describe("Search", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      reefsList: {
        list: [mockReef],
        loading: false,
        error: null,
      },
      homepage: {
        reefOnMap: mockReef,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <Search />
        </Router>
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
