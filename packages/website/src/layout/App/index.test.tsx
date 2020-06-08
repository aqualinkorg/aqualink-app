import React from "react";
import { render } from "@testing-library/react";
import App from "./index";

jest.mock("../NavBar", () => "mock-navbar");

test("renders as expected", () => {
  const { container } = render(<App />);
  expect(container).toMatchSnapshot();
});
