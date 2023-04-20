import React from 'react';
import { render } from '@testing-library/react';

import MenuDrawer from '.';

describe('MenuDrawer open', () => {
  const menuDrawerOpen = true;
  const element = render(
    <MenuDrawer open={menuDrawerOpen} onClose={() => {}} />,
  ).container;

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});

describe('MenuDrawer closed', () => {
  const menuDrawerOpen = false;
  const element = render(
    <MenuDrawer open={menuDrawerOpen} onClose={() => {}} />,
  ).container;

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
