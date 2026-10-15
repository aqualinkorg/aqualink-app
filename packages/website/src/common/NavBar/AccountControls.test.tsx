import React from 'react';
import { act, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { mockUser, mockAdminUser } from 'mocks/mockUser';
import { mockSite } from 'mocks/mockSite';
import { renderWithProviders } from 'utils/test-utils';
import requests from 'helpers/requests';
import { clearCollection } from 'store/Collection/collectionSlice';
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

afterEach(() => {
  vi.restoreAllMocks();
});

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

test('keeps one interceptor across state updates and signs out with the latest collection', async () => {
  const { default: AccountControls } = await accountModule;
  const interceptors = requests.axiosInstance.interceptors.response;
  const register = vi.spyOn(interceptors, 'use');
  const eject = vi.spyOn(interceptors, 'eject');
  const makeStore = (collectionId: number) => {
    const store = mockStore({
      user: { userInfo: { ...mockUser, collection: { id: 77 } } },
      collection: { details: { id: collectionId } },
    });
    store.dispatch = vi.fn();
    return store;
  };
  const initialStore = makeStore(99);
  const { rerender, unmount } = renderWithProviders(
    <Provider store={initialStore}>
      <AccountControls />
    </Provider>,
  );
  const currentStore = makeStore(77);
  rerender(
    <Provider store={currentStore}>
      <AccountControls />
    </Provider>,
  );
  expect(register).toHaveBeenCalledTimes(1);
  const reject = register.mock.calls[0][1]!;
  const error = { response: { status: 401 } };
  await act(async () => {
    await expect(reject(error)).rejects.toBe(error);
  });
  expect(currentStore.dispatch).toHaveBeenCalledWith(clearCollection());
  expect(initialStore.dispatch).not.toHaveBeenCalled();
  expect(screen.getByRole('dialog', { name: 'Sign in' })).toBeInTheDocument();
  unmount();
  expect(eject).toHaveBeenCalledWith(register.mock.results[0].value);
  const calls = vi.mocked(currentStore.dispatch).mock.calls.length;
  await expect(reject(error)).rejects.toBe(error);
  expect(currentStore.dispatch).toHaveBeenCalledTimes(calls);
});

test('handles concurrent auth failures once and resets for a new session', async () => {
  const { default: AccountControls } = await accountModule;
  const register = vi.spyOn(
    requests.axiosInstance.interceptors.response,
    'use',
  );
  const makeStore = (token: string) => {
    const store = mockStore({
      user: { userInfo: { ...mockUser, token, collection: { id: 77 } } },
      collection: { details: null },
    });
    store.dispatch = vi.fn();
    return store;
  };
  const first = makeStore('first-session');
  const { rerender } = renderWithProviders(
    <Provider store={first}>
      <AccountControls />
    </Provider>,
  );
  const reject = register.mock.calls[0][1]!;
  const unauthorized = { response: { status: 401 } };
  const forbidden = { response: { status: 403 } };
  const serverError = { response: { status: 500 } };
  await expect(reject(serverError)).rejects.toBe(serverError);
  expect(first.dispatch).not.toHaveBeenCalled();
  await act(async () => {
    await expect(reject(unauthorized)).rejects.toBe(unauthorized);
    await expect(reject(forbidden)).rejects.toBe(forbidden);
  });
  expect(first.dispatch).toHaveBeenCalledTimes(1);
  const second = makeStore('second-session');
  rerender(
    <Provider store={second}>
      <AccountControls />
    </Provider>,
  );
  await act(async () => {
    await expect(reject(forbidden)).rejects.toBe(forbidden);
  });
  expect(second.dispatch).toHaveBeenCalledTimes(1);
  expect(register).toHaveBeenCalledTimes(1);
});

test('ignores captured handlers after StrictMode cleanup', async () => {
  const { default: AccountControls } = await accountModule;
  const register = vi.spyOn(
    requests.axiosInstance.interceptors.response,
    'use',
  );
  const eject = vi.spyOn(requests.axiosInstance.interceptors.response, 'eject');
  const store = mockStore({
    user: { userInfo: { ...mockUser, collection: { id: 77 } } },
    collection: { details: null },
  });
  store.dispatch = vi.fn();
  const { unmount } = renderWithProviders(
    <React.StrictMode>
      <AccountControls />
    </React.StrictMode>,
    { store },
  );
  expect(register).toHaveBeenCalledTimes(2);
  expect(eject).toHaveBeenCalledTimes(1);
  const error = { response: { status: 401 } };
  await expect(register.mock.calls[0][1]!(error)).rejects.toBe(error);
  expect(store.dispatch).not.toHaveBeenCalled();
  await act(async () => {
    await expect(register.mock.calls[1][1]!(error)).rejects.toBe(error);
  });
  expect(store.dispatch).toHaveBeenCalledTimes(1);
  unmount();
  expect(eject).toHaveBeenCalledTimes(2);
});
