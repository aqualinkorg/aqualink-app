import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import InfoFooter from '.';

describe('InfoFooter', () => {
  const element = renderWithProviders(<InfoFooter />).container;

  it('should render as expected', () => {
    expect(element).toMatchSnapshot();
  });
});

describe('InfoFooter with projects link', () => {
  const element = renderWithProviders(
    <InfoFooter showProjectsLink />,
  ).container;

  it('should render as expected', () => {
    expect(element).toMatchSnapshot();
  });
});
