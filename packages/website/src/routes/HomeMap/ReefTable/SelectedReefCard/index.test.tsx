import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import configureStore from "redux-mock-store";
import { Provider } from "react-redux";

import SelectedReefCard from ".";
import { mockReef } from "../../../../mocks/mockReef";

jest.mock("react-chartjs-2", () => ({
  Line: () => "Mock-Line",
  Chart: {
    pluginService: {
      register: jest.fn(),
    },
  },
}));

const reef = {
  details: mockReef,
};

const mockStore = configureStore([]);

const store = mockStore({
  selectedReef: reef,
  homepage: {
    reefOnMap: reef,
  },
  surveyList: {
    list: [],
  },
  survey: {
    selectedSurvey: {
      details: null,
    },
  },
});

store.dispatch = jest.fn();

test("renders as expected", () => {
  process.env.REACT_APP_FEATURED_REEF_ID = "2";

  const { container } = render(
    <Provider store={store}>
      <Router>
        <SelectedReefCard />
      </Router>
    </Provider>
  );
  expect(container).toMatchSnapshot();
});

test("renders loading as expected", () => {
  process.env.REACT_APP_FEATURED_REEF_ID = "4";
  const { container } = render(
    <Provider store={store}>
      <Router>
        <SelectedReefCard />
      </Router>
    </Provider>
  );
  expect(container).toMatchSnapshot();
});
