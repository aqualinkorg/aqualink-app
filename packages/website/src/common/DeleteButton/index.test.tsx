import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { mockUser } from 'mocks/mockUser';
import { renderWithProviders } from 'utils/test-utils';
import DeleteButton from '.';

const mockStore = configureStore([]);

const getStore = () => {
  const store = mockStore({
    user: {
      userInfo: mockUser,
    },
  });

  store.dispatch = vi.fn();

  return store;
};

describe('Delete Button', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const dummyFunc = () =>
      new Promise<void>((resolve) => {
        resolve();
      });

    element = renderWithProviders(
      <DeleteButton onConfirm={dummyFunc} header="some text" />,
      { store: getStore() },
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});

describe('Delete Button confirmation dialog', () => {
  const renderButton = (props: {
    onConfirm: () => Promise<any>;
    onSuccess?: () => void;
    onError?: () => void;
  }) => {
    const { container } = renderWithProviders(
      <DeleteButton {...props} header="some text" />,
      { store: getStore() },
    );

    const isDialogOpen = () =>
      container.querySelector('mock-dialog')?.getAttribute('open') === 'true';

    const openDialog = () =>
      fireEvent.click(
        container.querySelector('mock-iconbutton') as HTMLElement,
      );

    const confirm = () =>
      fireEvent.click(screen.getByRole('button', { name: 'Yes' }));

    return { isDialogOpen, openDialog, confirm };
  };

  it('closes the dialog once the deletion succeeds', async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    const onSuccess = vi.fn();
    const { isDialogOpen, openDialog, confirm } = renderButton({
      onConfirm,
      onSuccess,
    });

    openDialog();
    expect(isDialogOpen()).toBe(true);

    confirm();

    await waitFor(() => expect(onSuccess).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(isDialogOpen()).toBe(false));
  });

  it('does not issue a second deletion while the first one is in flight', async () => {
    let resolveConfirm: () => void = () => {};
    const onConfirm = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          // eslint-disable-next-line fp/no-mutation
          resolveConfirm = resolve;
        }),
    );
    const { isDialogOpen, openDialog, confirm } = renderButton({ onConfirm });

    openDialog();
    confirm();
    confirm();

    expect(onConfirm).toHaveBeenCalledTimes(1);

    resolveConfirm();

    await waitFor(() => expect(isDialogOpen()).toBe(false));
  });

  it('keeps the dialog open and surfaces the error when the deletion fails', async () => {
    const onConfirm = vi.fn(() => Promise.reject(new Error('Request failed')));
    const onError = vi.fn();
    const { isDialogOpen, openDialog, confirm } = renderButton({
      onConfirm,
      onError,
    });

    openDialog();
    confirm();

    await waitFor(() => expect(onError).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Request failed')).toBeInTheDocument();
    expect(isDialogOpen()).toBe(true);
  });
});
