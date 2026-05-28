import requests from 'helpers/requests';
import siteServices from './siteServices';

vi.mock('helpers/requests', () => ({
  default: {
    send: vi.fn(() => Promise.resolve({ data: [] })),
  },
}));

describe('siteServices', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('adds the optional historical date to site list requests', () => {
    siteServices.getSites({ date: '2024-04-15' });

    expect(requests.send).toHaveBeenCalledWith({
      url: 'sites?date=2024-04-15',
      method: 'GET',
    });
  });

  it('adds the optional historical date to site detail requests', () => {
    siteServices.getSite('10', '2024-04-15');

    expect(requests.send).toHaveBeenCalledWith({
      url: 'sites/10?date=2024-04-15',
      method: 'GET',
    });
  });

  it('supports daily data requests bounded only by an end date', () => {
    siteServices.getSiteDailyData('10', undefined, '2024-04-15');

    expect(requests.send).toHaveBeenCalledWith({
      url: 'sites/10/daily_data?end=2024-04-15T23%3A59%3A59.999Z',
      method: 'GET',
    });
  });
});
