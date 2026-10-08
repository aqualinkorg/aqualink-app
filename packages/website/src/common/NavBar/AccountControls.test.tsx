import React from 'react';
import { fireEvent, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser, mockAdminUser } from 'mocks/mockUser';
import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import {
  unsetLatestData,
  unsetSpotterPosition,
  unsetSelectedSite,
} from 'store/Sites/selectedSiteSlice';

vi.doUnmock('@mui/material');
const accountModule = import('./AccountControls');

vi.mock('../RegisterDialog', () => ({ default: () => null }));
vi.mock('../SignInDialog', () => ({
  default: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="Sign in" /> : null,
}));

const mockStore = configureStore([]);

async function renderAccount(user: typeof mockUser | null) {
  const { default: AccountControls } = await accountModule;
  const store = mockStore({
    user: { userInfo: user },
    collection: { details: null },
  });
  store.dispatch = vi.fn();
  renderWithProviders(<AccountControls />, { store });
  return store;
}

test('opens sign in for a signed-out visitor', async () => {
  await renderAccount(null);
  fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(screen.getByRole('dialog', { name: 'Sign in' })).toBeInTheDocument();
});

test.each([mockUser, mockAdminUser])(
  'keeps account links appropriate to $adminLevel',
  async (user) => {
    await renderAccount(user);
    fireEvent.click(screen.getByRole('button', { name: 'Open account menu' }));
    expect(screen.getByRole('menuitem', { name: 'Dashboard' })).toHaveAttribute(
      'href',
      '/dashboard',
    );
    if (user.adminLevel === 'super_admin') {
      expect(screen.getByRole('menuitem', { name: 'Uploads' })).toHaveAttribute(
        'href',
        '/uploads',
      );
      expect(
        screen.getByRole('menuitem', { name: 'Monitoring' }),
      ).toHaveAttribute('href', '/monitoring');
    } else {
      expect(
        screen.queryByRole('menuitem', { name: 'Uploads' }),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole('menuitem', { name: 'Monitoring' }),
      ).not.toBeInTheDocument();
    }
  },
);

test('clears selected-site state when navigating to an administered site', async () => {
  const store = await renderAccount({
    ...mockUser,
    administeredSites: [{ ...mockSite, id: 42, name: 'Test reef' }],
  });
  fireEvent.click(screen.getByRole('button', { name: 'Open account menu' }));
  fireEvent.click(screen.getByRole('menuitem', { name: 'Test reef' }));
  expect(store.dispatch).toHaveBeenCalledWith(unsetSelectedSite());
  expect(store.dispatch).toHaveBeenCalledWith(unsetSpotterPosition());
  expect(store.dispatch).toHaveBeenCalledWith(unsetLatestData());
  expect(
    screen.getByRole('button', { name: 'Open account menu' }),
  ).toHaveAttribute('aria-expanded', 'false');
});
