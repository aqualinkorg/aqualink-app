import React from "react";
import { render } from "@testing-library/react";
import ReefNavBar from ".";

jest.mock("react-router-dom", () => ({
  useHistory: () => ({
    push: jest.fn(),
  }),
}));

test("renders as expected", () => {
  const { container } = render(
    <ReefNavBar reefName="" managerName="" lastSurvey="May 10, 2020" />
  );
  expect(container).toMatchSnapshot();
});
