import { describe, expect, it, vi, beforeEach } from 'vitest';
import requests from 'helpers/requests';
import siteServices from './siteServices';

vi.mock('helpers/requests', () => ({
  default: {
    send: vi.fn(),
  },
}));

describe('siteServices.getSites', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requests live sites when historical date is not provided', () => {
    siteServices.getSites();

    expect(requests.send).toHaveBeenCalledWith({
      url: 'sites',
      method: 'GET',
    });
  });

  it('requests historical sites with at query param', () => {
    siteServices.getSites('2024-03-01');

    expect(requests.send).toHaveBeenCalledWith({
      url: 'sites?at=2024-03-01',
      method: 'GET',
    });
  });
});
