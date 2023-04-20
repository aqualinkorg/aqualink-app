import React from 'react';
import { render } from '@testing-library/react';
import LocationMap from '.';

test('renders as expected', () => {
  const { container } = render(
    <LocationMap
      markerPositionLat="1"
      markerPositionLng="1"
      updateMarkerPosition={() => {}}
    />,
  );
  expect(container).toMatchSnapshot();
});
