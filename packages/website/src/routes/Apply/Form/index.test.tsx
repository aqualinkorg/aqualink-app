import React from "react";
import { render } from "@testing-library/react";

import Form from ".";

jest.mock("@material-ui/pickers", () => ({
  MuiPickersUtilsProvider: () => "Mock-MuiPickersUtilsProvider",
}));

test("renders as expected", () => {
  const { container } = render(
    <Form reefName="Mock Reef" agreed handleFormSubmit={jest.fn()} />
  );
  expect(container).toMatchSnapshot();
});
