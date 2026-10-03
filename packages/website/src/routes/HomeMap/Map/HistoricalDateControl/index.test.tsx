import React from 'react';
import { Provider } from 'react-redux';
import { fireEvent, render, screen } from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { setSitesListDate } from 'store/Sites/sitesListSlice';
import HistoricalDateControl from '.';

const mockStore = configureStore([]);

// MUI components are rendered as `mock-*` elements (see setupTests.tsx)
const renderControl = (date: string | null, refreshing = false) => {
  const store = mockStore({
    sitesList: { list: [], loading: false, error: null, date, refreshing },
  });
  store.dispatch = vi.fn();
  const { container } = render(
    <Provider store={store}>
      <HistoricalDateControl />
    </Provider>,
  );
  return { store, container };
};

describe('HistoricalDateControl', () => {
  it('shows the live state when no date is selected', () => {
    const { container } = renderControl(null);

    expect(screen.getByText('Latest data')).toBeInTheDocument();
    expect(screen.queryByText('Today')).not.toBeInTheDocument();
    expect(
      container.querySelector('mock-date-picker')?.getAttribute('value'),
    ).toBeNull();
    expect(container.querySelector('mock-circularprogress')).toBeNull();
  });

  it('shows the selected date and goes back to live data', () => {
    const { store, container } = renderControl('2020-01-15');

    expect(screen.getByText('Data as of')).toBeInTheDocument();
    expect(
      container.querySelector('mock-date-picker')?.getAttribute('value'),
    ).toContain('Jan 15 2020');

    fireEvent.click(screen.getByText('Today'));
    expect(store.dispatch).toHaveBeenCalledWith(setSitesListDate(null));
  });

  it('shows a progress indicator while the new date loads', () => {
    const { container } = renderControl('2020-01-15', true);

    expect(container.querySelector('mock-circularprogress')).not.toBeNull();
  });
});
