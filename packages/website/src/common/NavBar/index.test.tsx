import React from 'react';
import configureStore from 'redux-mock-store';
import { fireEvent, screen } from '@testing-library/react';

import { mockUser } from 'mocks/mockUser';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import HomePageNavBar from '.';

vi.mock('../RegisterDialog', () => ({ default: 'Mock-RegisterDialog' }));
vi.mock('../SignInDialog', () => ({ default: 'Mock-SignInDialog' }));
vi.mock('../Search', () => ({ default: 'Mock-Search' }));
vi.mock('../MenuDrawer', () => ({ default: 'Mock-MenuDrawer' }));

const mockStore = configureStore([]);

describe('NavBar with routeButtons', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    store.dispatch = vi.fn();

    element = renderWithProviders(
      <HomePageNavBar routeButtons searchLocation={false} />,
      { store },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});

describe('NavBar without routeButtons', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
      collection: {
        details: mockCollection,
        loading: false,
        error: null,
      },
    });

    store.dispatch = vi.fn();

    element = renderWithProviders(<HomePageNavBar searchLocation={false} />, {
      store,
    }).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });

  it('shows essential navigation while scrolled and restores the full header at the top', () => {
    expect(
      screen.queryByRole('navigation', { name: 'Main navigation' }),
    ).not.toBeInTheDocument();
    const header = element.querySelector('mock-appbar');
    fireEvent.scroll(window, { target: { scrollY: 120 } });
    expect(header?.getAttribute('classname')).toContain('navbar--compact');
    expect(
      (header as HTMLElement).style.getPropertyValue('--navbar-progress'),
    ).toBe('0.4');
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Map', exact: true }),
    ).toHaveAttribute('href', '/map');
    expect(screen.getByRole('link', { name: 'Heatwave' })).toHaveAttribute(
      'href',
      '/tracker',
    );
    expect(
      screen.queryByRole('link', { name: 'Bristlemouth' }),
    ).not.toBeInTheDocument();
    fireEvent.scroll(window, { target: { scrollY: 192 } });
    expect(
      (header as HTMLElement).style.getPropertyValue('--navbar-progress'),
    ).toBe('1');
    fireEvent.scroll(window, { target: { scrollY: 120 } });
    expect(
      (header as HTMLElement).style.getPropertyValue('--navbar-progress'),
    ).toBe('0.4');
    fireEvent.scroll(window, { target: { scrollY: 0 } });
    expect(header?.getAttribute('classname')).not.toContain('navbar--compact');
    expect(
      screen.queryByRole('navigation', { name: 'Main navigation' }),
    ).not.toBeInTheDocument();
  });
});
