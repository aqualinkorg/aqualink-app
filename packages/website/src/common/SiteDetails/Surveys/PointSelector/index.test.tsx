import React from "react";
import { render } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router-dom";
import PointSelector from ".";

test("renders as expected", () => {
  const { container } = render(
    <Router>
      <PointSelector
        reefId={1}
        pointOptions={[]}
        point="All"
        pointId={-1}
        editPoiNameDraft={null}
        isReefAdmin={false}
        editPoiNameLoading={false}
        onChangePoiName={() => {}}
        handlePointChange={() => {}}
        disableEditPoiName={() => {}}
        enableEditPoiName={() => {}}
        submitPoiNameUpdate={() => {}}
        onDeleteButtonClick={() => {}}
      />
    </Router>
  );
  expect(container).toMatchSnapshot();
});
