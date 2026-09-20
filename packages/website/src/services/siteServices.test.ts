import requests from 'helpers/requests';
import siteServices from './siteServices';

vi.mock('helpers/requests', () => ({
  default: {
    send: vi.fn(() => Promise.resolve({ data: [] })),
    generateUrlQueryParams: vi.fn(() => ''),
  },
}));

const mockedSend = vi.mocked(requests.send);

beforeEach(() => {
  mockedSend.mockClear();
});

describe('siteServices date parameters', () => {
  it('appends the date query param to the sites request', async () => {
    await siteServices.getSites({ date: '2024-04-15' });

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'sites?date=2024-04-15', method: 'GET' }),
    );
  });

  it('requests the plain sites endpoint when no date is given', async () => {
    await siteServices.getSites();

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'sites', method: 'GET' }),
    );
  });

  it('appends the date query param to the site request', async () => {
    await siteServices.getSite('42', '2024-04-15');

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({ url: 'sites/42?date=2024-04-15' }),
    );
  });

  it('converts a YYYY-MM-DD end param to end-of-day for daily data', async () => {
    await siteServices.getSiteDailyData('42', undefined, '2024-04-15');

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'sites/42/daily_data?end=2024-04-15T23%3A59%3A59.999Z',
      }),
    );
  });

  it('keeps start-only daily data requests unchanged', async () => {
    await siteServices.getSiteDailyData('42', '2024-01-01T00:00:00.000Z');

    expect(mockedSend).toHaveBeenCalledWith(
      expect.objectContaining({
        url: 'sites/42/daily_data?start=2024-01-01T00%3A00%3A00.000Z',
      }),
    );
  });
});
