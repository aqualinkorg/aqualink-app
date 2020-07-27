import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ReefTable from ".";

const mockStore = configureStore([]);

describe("ReefTable", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      reefsList: {
        list: [],
        loading: false,
        error: null,
      },
      selectedReef: {
        loading: false,
        error: null,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <ReefTable />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
