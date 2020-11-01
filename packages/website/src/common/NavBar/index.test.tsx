import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";

import HomePageNavBar from ".";
import { mockUser } from "../../mocks/mockUser";

jest.mock("../RegisterDialog", () => "Mock-RegisterDialog");
jest.mock("../SignInDialog", () => "Mock-SignInDialog");
jest.mock("../Search", () => "Mock-Search");
jest.mock("../MenuDrawer", () => "Mock-MenuDrawer");

const mockStore = configureStore([]);

describe("NavBar with routeButtons", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <HomePageNavBar routeButtons searchLocation={false} />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});

describe("NavBar without routeButtons", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <HomePageNavBar searchLocation={false} />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
