import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import LocationMap from '.';

test('renders as expected', () => {
  const { container } = renderWithProviders(
    <LocationMap
      markerPositionLat="1"
      markerPositionLng="1"
      updateMarkerPosition={() => {}}
    />,
  );
  expect(container).toMatchSnapshot();
});
