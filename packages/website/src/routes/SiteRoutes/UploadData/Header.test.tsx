import React from "react";
import { render } from "@testing-library/react";
import Header from "./Header";
import { mockSite } from "../../../mocks/mockSite";

test("renders as expected", () => {
  const { container } = render(<Header site={mockSite} />);
  expect(container).toMatchSnapshot();
});
