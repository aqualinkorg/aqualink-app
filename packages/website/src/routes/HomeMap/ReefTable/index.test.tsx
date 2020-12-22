import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import ReefTable from ".";
import { mockReef } from "../../../mocks/mockReef";
import { mockUser } from "../../../mocks/mockUser";

jest.mock("./SelectedReefCard", () => "Mock-SelectedReefCard");

const mockStore = configureStore([]);

describe("ReefTable", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      reefsList: {
        list: [mockReef],
        reefsToDisplay: [mockReef],
        loading: false,
        error: null,
      },
      selectedReef: {
        loading: false,
        error: null,
      },
      homepage: {
        reefOnMap: null,
      },
    });

    const openDrawer = false;

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <ReefTable openDrawer={openDrawer} />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
