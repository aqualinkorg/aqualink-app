import React from 'react';
import configureStore from 'redux-mock-store';
import { within } from '@testing-library/react';

import { mockUser } from 'mocks/mockUser';
import { mockCollection } from 'mocks/mockCollection';
import { renderWithProviders } from 'utils/test-utils';
import LandingPage from '.';

const mockStore = configureStore([]);

describe('Landing Page', () => {
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

    element = renderWithProviders(<LandingPage />, { store }).container;
  });

  it('provides the map and registration paths without requiring sign in', () => {
    const page = within(element.querySelector('main')!);
    expect(page.getByRole('heading', { level: 1 })).toHaveTextContent(
      'A clearer picture.A healthier ocean.',
    );
    expect(page.getByRole('link', { name: 'View the map' })).toHaveAttribute(
      'href',
      '/map',
    );
    page
      .getAllByRole('link', { name: 'Register your site' })
      .forEach((link) => {
        expect(link).toHaveAttribute('href', '/register');
      });
    expect(
      page.getByRole('link', { name: 'Explore the Aqualink buoy' }),
    ).toHaveAttribute('href', '/buoy');
    expect(
      page.getByRole('link', { name: 'Explore the drone project' }),
    ).toHaveAttribute('href', '/drones');
  });

  it('links field surveys to an accessible section and describes its photographs', () => {
    const page = within(element);
    expect(
      page.getByRole('link', { name: 'Explore field surveys' }),
    ).toHaveAttribute('href', '#surveys');
    expect(
      page.getByRole('region', { name: 'Bring the reef into focus.' }),
    ).toHaveAttribute('id', 'surveys');
    within(element.querySelector('main')!)
      .getAllByRole('img')
      .forEach((image) => {
        expect(image).toHaveAttribute('alt', expect.stringMatching(/\w/));
        expect(image).toHaveAttribute('src', expect.stringMatching(/\w/));
      });
    expect(
      page.getByRole('navigation', { name: 'Get involved' }),
    ).toBeInTheDocument();
  });
});
