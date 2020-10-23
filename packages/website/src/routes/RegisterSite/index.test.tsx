import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import Apply from ".";
import { mockUser } from "../../mocks/mockUser";

const mockStore = configureStore([]);

jest.mock("../../common/NavBar", () => "Mock-NavBar");
jest.mock("./LocationMap", () => "Mock-LocationMap");

describe("Site registration page", () => {
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
        <Apply />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
