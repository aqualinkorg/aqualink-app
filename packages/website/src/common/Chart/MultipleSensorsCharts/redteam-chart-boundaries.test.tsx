import React from 'react';
import { Provider } from 'react-redux';
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import configureStore from 'redux-mock-store';
import { MemoryRouter } from 'react-router-dom';
import { SnackbarProvider } from 'notistack';
import ThemeProvider from '@mui/styles/ThemeProvider';
import theme from 'layout/App/theme';
import { mockSite } from 'mocks/mockSite';
import MultipleSensorsCharts from '.';

const captured = vi.hoisted(() => ({ chart: {} as Record<string, any> }));

vi.mock('./ChartWithCard', () => ({
  default: (props: Record<string, any>) => {
    if (props.id === 'temperature') captured.chart = props;
    return null;
  },
}));

vi.mock('./DownloadCSVDialog', () => ({
  default: ({
    open,
    onClose,
  }: {
    open: boolean;
    onClose: (...args: boolean[]) => void;
  }) =>
    open ? (
      <button type="button" onClick={() => onClose(true, false, false, false)}>
        Confirm default CSV
      </button>
    ) : null,
}));

const mockStore = configureStore([]);

function mountHistoricalCharts(timezone = 'UTC') {
  const store = mockStore({
    selectedSite: {
      details: { ...mockSite, timezone },
      timeSeriesDataRange: {
        bottomTemperature: [
          {
            type: 'spotter',
            depth: null,
            data: [
              {
                minDate: '2020-01-01T00:00:00.000Z',
                maxDate: '2026-01-01T00:00:00.000Z',
              },
            ],
          },
        ],
      },
      timeSeriesDataRangeLoading: false,
    },
    user: { userInfo: null },
  });
  store.dispatch = vi.fn();
  render(
    <MemoryRouter
      initialEntries={[
        '/sites/1?date=2025-01-01&start=2024-12-01&end=2025-01-01',
      ]}
    >
      <ThemeProvider theme={theme}>
        <SnackbarProvider>
          <Provider store={store}>
            <MultipleSensorsCharts
              site={{ ...mockSite, timezone }}
              disableGutters
              displayOceanSenseCharts
              surveysFiltered={false}
              hasAdditionalSensorData={false}
            />
          </Provider>
        </SnackbarProvider>
      </ThemeProvider>
    </MemoryRouter>,
  );
  return store;
}

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('historical chart boundaries redteam', () => {
  it('control: mounts a multiday historical chart and requests data through the entire final day', async () => {
    const store = mountHistoricalCharts();
    await waitFor(() => expect(store.dispatch).toHaveBeenCalled());
    expect(captured.chart.chartStartDate).toBe('2024-12-01T00:00:00.000Z');
    expect(captured.chart.chartEndDate).toBe('2025-01-01T23:59:59.000Z');
    expect(captured.chart.isPickerErrored).toBe(false);
  });

  it('default CSV should include the same final-day noon observation as the historical chart', async () => {
    const fetchMock = vi.fn(
      (props: RequestInfo | URL) => new Promise<Response>(() => {}),
    );
    vi.stubGlobal('fetch', fetchMock);
    mountHistoricalCharts();
    await waitFor(() => expect(captured.chart.pickerEndDate).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm default CSV' }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const request = new URL(fetchMock.mock.calls[0][0] as string);
    const noonObservation = Date.parse('2025-01-01T12:00:00.000Z');
    expect(Date.parse(captured.chart.chartEndDate)).toBeGreaterThan(
      noonObservation,
    );
    expect(Date.parse(request.searchParams.get('end')!)).toBeGreaterThanOrEqual(
      noonObservation,
    );
  });

  it.each([
    [
      'America/Los_Angeles',
      '2024-12-01T08:00:00.000Z',
      '2025-01-02T07:59:59.999Z',
    ],
    [
      'Pacific/Auckland',
      '2024-11-30T11:00:00.000Z',
      '2025-01-01T10:59:59.999Z',
    ],
  ])('CSV uses site-local chart bounds in %s', async (timezone, start, end) => {
    const fetchMock = vi.fn(
      (props: RequestInfo | URL) => new Promise<Response>(() => {}),
    );
    vi.stubGlobal('fetch', fetchMock);
    mountHistoricalCharts(timezone);
    await waitFor(() => expect(captured.chart.pickerEndDate).toBeTruthy());
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    fireEvent.click(
      screen.getByRole('button', { name: 'Confirm default CSV' }),
    );
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const request = new URL(fetchMock.mock.calls[0][0] as string);
    expect(request.searchParams.get('start')).toBe(start);
    expect(request.searchParams.get('end')).toBe(end);
  });
});
