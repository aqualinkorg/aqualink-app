import React from "react";
import { Provider } from "react-redux";
import { render } from "@testing-library/react";
import configureStore from "redux-mock-store";
import Apply from ".";

const mockStore = configureStore([]);

jest.mock("../../common/NavBar", () => "Mock-NavBar");
jest.mock("./LocationMap", () => "Mock-LocationMap");

describe("Site registration page", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: {
          email: "test@mail.com",
          organization: "Some Organization",
          fullName: "Test User",
          adminLevel: "super_admin",
          firebaseUid: "RaNdOmStRiNg",
          administeredReefs: [],
          token: "RaNdOmStRiNg",
        },
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
