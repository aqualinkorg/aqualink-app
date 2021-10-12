import React from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

import SiteTable from ".";
import { mockSite } from "../../../mocks/mockSite";
import { mockUser } from "../../../mocks/mockUser";

jest.mock("./SelectedSiteCard", () => "Mock-SelectedSiteCard");

const mockStore = configureStore([]);

describe("SiteTable", () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
      },
      sitesList: {
        list: [mockSite],
        sitesToDisplay: [mockSite],
        loading: false,
        error: null,
      },
      selectedSite: {
        loading: false,
        error: null,
      },
      homepage: {
        siteOnMap: null,
      },
    });

    const openDrawer = false;

    store.dispatch = jest.fn();

    element = render(
      <Provider store={store}>
        <SiteTable isDrawerOpen={openDrawer} />
      </Provider>
    ).container;
  });

  it("should render with given state from Redux store", () => {
    expect(element).toMatchSnapshot();
  });
});
