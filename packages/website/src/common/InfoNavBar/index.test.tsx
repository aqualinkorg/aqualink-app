import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import InfoNavBar from '.';

describe('InfoNavBar light', () => {
  const element = renderWithProviders(
    <InfoNavBar currentPage="/examples" />,
  ).container;

  it('should render as expected', () => {
    expect(element).toMatchSnapshot();
  });
});

describe('InfoNavBar hero', () => {
  const element = renderWithProviders(<InfoNavBar variant="hero" />).container;

  it('should render as expected', () => {
    expect(element).toMatchSnapshot();
  });
});
