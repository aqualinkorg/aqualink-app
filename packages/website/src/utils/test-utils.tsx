/* eslint-disable import/no-extraneous-dependencies */
import { PropsWithChildren } from 'react';

import * as React from 'react';

import { render, RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';
import theme from 'layout/App/theme';
import { Store } from 'redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';

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
        <StoreProvider>
          <BrowserRouter>{children}</BrowserRouter>
        </StoreProvider>
      </ThemeProvider>
    ),
    ...options,
  });
};
