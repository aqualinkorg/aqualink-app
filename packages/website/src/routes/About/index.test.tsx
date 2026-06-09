import React from 'react';
import { Provider } from 'react-redux';
import { render } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { mockUser } from 'mocks/mockUser';

import About from '.';

rstest.mock('common/NavBar', () => ({ default: 'Mock-NavBar' }));
rstest.mock('common/Footer', () => ({ default: 'Mock-Footer' }));

const mockStore = configureStore([]);
const theme = createTheme(); // Create a simple theme instance

describe('About', () => {
  let element: HTMLElement;
  beforeEach(() => {
    const store = mockStore({
      user: {
        userInfo: mockUser,
        loading: false,
        error: null,
      },
    });

    store.dispatch = rstest.fn();

    element = render(
      <Provider store={store}>
        <Router>
          <ThemeProvider theme={theme}>
            <About />
          </ThemeProvider>
        </Router>
      </Provider>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
