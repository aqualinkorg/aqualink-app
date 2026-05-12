import requests from 'helpers/requests';
import siteServices from './siteServices';

vi.mock('helpers/requests', () => ({
  default: {
    send: vi.fn(),
  },
}));

describe('siteServices', () => {
  beforeEach(() => {
    vi.mocked(requests.send).mockReset();
  });

  it('requests sites for the selected historical date', () => {
    const date = '2026-02-15T23:59:59.999Z';

    siteServices.getSites(date);

    expect(requests.send).toHaveBeenCalledWith({
      url: `sites?date=${encodeURIComponent(date)}`,
      method: 'GET',
    });
  });
});
