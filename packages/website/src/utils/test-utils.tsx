/* eslint-disable import/no-extraneous-dependencies */
import React, { PropsWithChildren } from 'react';

import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { ThemeProvider } from '@mui/material/styles';
import theme from 'layout/App/theme';

type RenderWithProvidersOptions = Omit<RenderOptions, 'queries'> & {
  store?: Store;
};

export const renderWithProviders = (
  ui: React.ReactElement,
  { store, ...options }: RenderWithProvidersOptions = {},
) => {
  const StoreProvider = store
    ? ({ children }: PropsWithChildren) => (
        <Provider store={store}>{children}</Provider>
      )
    : React.Fragment;

  return render(ui, {
    wrapper: ({ children }) => (
      <ThemeProvider theme={theme}>
        <StoreProvider>{children}</StoreProvider>
      </ThemeProvider>
    ),
    ...options,
  });
};
