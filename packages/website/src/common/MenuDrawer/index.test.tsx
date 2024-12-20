import React from 'react';
import { renderWithProviders } from 'utils/test-utils';
import MenuDrawer from '.';

describe('MenuDrawer open', () => {
  const menuDrawerOpen = true;
  const element = renderWithProviders(
    <MenuDrawer open={menuDrawerOpen} onClose={() => {}} />,
  ).container;

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});

describe('MenuDrawer closed', () => {
  const menuDrawerOpen = false;
  const element = renderWithProviders(
    <MenuDrawer open={menuDrawerOpen} onClose={() => {}} />,
  ).container;

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
