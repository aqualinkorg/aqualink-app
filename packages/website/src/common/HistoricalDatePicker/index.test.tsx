import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { setSelectedDate } from 'store/Sites/sitesListSlice';
import HistoricalDatePicker from '.';

const mockStore = configureStore([]);

describe('HistoricalDatePicker', () => {
  it('opens the modal, applies a past date, and dispatches state updates', () => {
    const store = mockStore({
      sitesList: {
        list: [],
        filters: {},
        selectedDate: null,
        loading: false,
        error: null,
      },
    });
    store.dispatch = vi.fn() as any;

    render(
      <Provider store={store}>
        <HistoricalDatePicker variant="map" />
      </Provider>,
    );

    fireEvent.click(
      screen.getByRole('button', { name: /open historical date selector/i }),
    );

    const dateInput = screen.getByLabelText(/historical date/i);
    fireEvent.change(dateInput, { target: { value: '2024-04-15' } });
    fireEvent.click(screen.getByRole('button', { name: /apply date/i }));

    expect(store.dispatch).toHaveBeenCalledWith(setSelectedDate('2024-04-15'));
  });

  it('renders active historical date in site variant and supports resetting to latest', () => {
    const store = mockStore({
      sitesList: {
        list: [],
        filters: {},
        selectedDate: '2024-04-15',
        loading: false,
        error: null,
      },
    });
    store.dispatch = vi.fn() as any;

    render(
      <Provider store={store}>
        <HistoricalDatePicker variant="site" />
      </Provider>,
    );

    expect(
      screen.getByRole('button', { name: /historical date: 2024-04-15/i }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /reset to latest/i }));
    expect(store.dispatch).toHaveBeenCalledWith(setSelectedDate(null));
  });
});
