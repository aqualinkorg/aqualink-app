import React from 'react';
import configureStore from 'redux-mock-store';
import { fireEvent, screen, waitFor } from '@testing-library/react';

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

  it('shows essential navigation while scrolled and restores the full header at the top', async () => {
    expect(
      screen.queryByRole('navigation', { name: 'Main navigation' }),
    ).not.toBeInTheDocument();
    const header = element.querySelector('mock-appbar');
    fireEvent.scroll(window, { target: { scrollY: 136 } });
    await waitFor(
      () => {
        expect(
          (header as HTMLElement).style.getPropertyValue('--navbar-progress'),
        ).toBe('0.5');
      },
      { timeout: 3000 },
    );
    expect(header?.getAttribute('classname')).toContain('navbar--compact');
    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Map' })).toHaveAttribute(
      'href',
      '/map',
    );
    expect(screen.getByRole('link', { name: 'Heatwave' })).toHaveAttribute(
      'href',
      '/tracker',
    );
    expect(
      screen.queryByRole('link', { name: 'Bristlemouth' }),
    ).not.toBeInTheDocument();
    fireEvent.scroll(window, { target: { scrollY: 160 } });
    await waitFor(
      () => {
        expect(
          (header as HTMLElement).style.getPropertyValue('--navbar-progress'),
        ).toBe('1');
      },
      { timeout: 3000 },
    );
    fireEvent.scroll(window, { target: { scrollY: 0 } });
    await waitFor(
      () => {
        expect(header?.getAttribute('classname')).not.toContain(
          'navbar--compact',
        );
      },
      { timeout: 3000 },
    );
    expect(
      screen.queryByRole('navigation', { name: 'Main navigation' }),
    ).not.toBeInTheDocument();
  });

  it('settles at the latest scroll position when direction changes mid-animation', async () => {
    const header = element.querySelector('mock-appbar') as HTMLElement;
    fireEvent.scroll(window, { target: { scrollY: 160 } });
    await waitFor(
      () => {
        expect(header.getAttribute('classname')).toContain('navbar--compact');
      },
      { timeout: 3000 },
    );
    fireEvent.scroll(window, { target: { scrollY: 0 } });
    fireEvent.scroll(window, { target: { scrollY: 136 } });
    await waitFor(
      () => {
        expect(header.style.getPropertyValue('--navbar-progress')).toBe('0.5');
      },
      { timeout: 3000 },
    );
    fireEvent.scroll(window, { target: { scrollY: 0 } });
    await waitFor(
      () => {
        expect(header.getAttribute('classname')).not.toContain(
          'navbar--compact',
        );
      },
      { timeout: 3000 },
    );
  });

  it('keeps the full header until it leaves the viewport and restores it before its slot reappears', () => {
    const header = element.querySelector('mock-appbar') as HTMLElement;
    fireEvent.scroll(window, { target: { scrollY: 95 } });
    expect(header.getAttribute('classname')).not.toContain('navbar--compact');
    fireEvent.scroll(window, { target: { scrollY: 136 } });
    expect(header.getAttribute('classname')).toContain('navbar--compact');
    fireEvent.scroll(window, { target: { scrollY: 95 } });
    expect(header.getAttribute('classname')).not.toContain('navbar--compact');
    fireEvent.scroll(window, { target: { scrollY: 0 } });
  });

  it('updates immediately when reduced motion is enabled', () => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const matchMedia = vi.spyOn(window, 'matchMedia').mockReturnValue({
      ...media,
      matches: true,
    });
    const store = mockStore({
      user: { userInfo: mockUser, loading: false, error: null },
      collection: { details: mockCollection, loading: false, error: null },
    });
    const { container, unmount } = renderWithProviders(
      <HomePageNavBar searchLocation={false} />,
      { store },
    );
    const header = container.querySelector('mock-appbar') as HTMLElement;
    fireEvent.scroll(window, { target: { scrollY: 160 } });
    expect(header.style.getPropertyValue('--navbar-progress')).toBe('1');
    fireEvent.scroll(window, { target: { scrollY: 0 } });
    expect(header.getAttribute('classname')).not.toContain('navbar--compact');
    unmount();
    matchMedia.mockRestore();
  });
});
