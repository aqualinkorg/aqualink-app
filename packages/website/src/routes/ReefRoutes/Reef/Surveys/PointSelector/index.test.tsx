import React from "react";
import { render } from "@testing-library/react";
import PointSelector from ".";

test("renders as expected", () => {
  const { container } = render(
    <PointSelector
      mountPois
      pointOptions={[]}
      point="Custom Point"
      editPoiNameDraft={{}}
      editPoiNameEnabled={{}}
      isReefAdmin={false}
      editPoiNameLoading={false}
      onChangePoiName={jest.fn()}
      handlePointChange={jest.fn()}
      toggleEditPoiNameEnabled={jest.fn()}
      submitPoiNameUpdate={jest.fn()}
      onDeleteButtonClick={jest.fn()}
    />
  );
  expect(container).toMatchSnapshot();
});
