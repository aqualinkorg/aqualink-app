import { configureStore } from '@reduxjs/toolkit';
import { mockSite } from 'mocks/mockSite';
import siteServices from 'services/siteServices';
import sitesReducer, { sitesRequest } from './sitesListSlice';
import selectedReducer, { siteRequest } from './selectedSiteSlice';

afterEach(() => vi.restoreAllMocks());

describe('date-aware site requests', () => {
  it('loads a new date and live data after a cached historical list', async () => {
    const getSites = vi
      .spyOn(siteServices, 'getSites')
      .mockResolvedValue({ data: [mockSite] } as never);
    const store = configureStore({ reducer: { sitesList: sitesReducer } });
    await store.dispatch(sitesRequest('2024-01-01') as never);
    await store.dispatch(sitesRequest('2024-01-01') as never);
    await store.dispatch(sitesRequest('2024-01-02') as never);
    await store.dispatch(sitesRequest() as never);
    expect(getSites.mock.calls).toEqual([
      ['2024-01-01'],
      ['2024-01-02'],
      [undefined],
    ]);
  });
  it('does not let an old list success or failure replace the selected day', () => {
    const first = sitesReducer(
      undefined,
      sitesRequest.pending('old', '2024-01-01'),
    );
    const second = sitesReducer(
      first,
      sitesRequest.pending('new', '2024-01-02'),
    );
    expect(second.list).toBeUndefined();
    const loaded = sitesReducer(
      second,
      sitesRequest.fulfilled({ list: [mockSite] }, 'new', '2024-01-02'),
    );
    expect(
      sitesReducer(
        loaded,
        sitesRequest.fulfilled({ list: [] }, 'old', '2024-01-01'),
      ),
    ).toEqual(loaded);
    expect(
      sitesReducer(
        loaded,
        sitesRequest.rejected(new Error('Old failure'), 'old', '2024-01-01'),
      ),
    ).toEqual(loaded);
  });
  it('does not let an old detail response replace another date or site', () => {
    const first = selectedReducer(
      undefined,
      siteRequest.pending('old', { id: '1', date: '2024-01-01' }),
    );
    const second = selectedReducer(
      first,
      siteRequest.pending('new', { id: '2', date: '2024-01-02' }),
    );
    const expected = { ...mockSite, id: 2, historicalDate: '2024-01-02' };
    const loaded = selectedReducer(
      second,
      siteRequest.fulfilled(expected, 'new', { id: '2', date: '2024-01-02' }),
    );
    expect(
      selectedReducer(
        loaded,
        siteRequest.fulfilled(mockSite, 'old', { id: '1', date: '2024-01-01' }),
      ),
    ).toEqual(loaded);
    expect(
      selectedReducer(
        loaded,
        siteRequest.rejected(new Error('Old failure'), 'old', {
          id: '1',
          date: '2024-01-01',
        }),
      ),
    ).toEqual(loaded);
  });
  it('sends the selected date to detail and ends daily history at that day', async () => {
    const getSite = vi.spyOn(siteServices, 'getSite').mockResolvedValue({
      data: { ...mockSite, historicalDate: '2024-01-02' },
    } as never);
    const daily = vi
      .spyOn(siteServices, 'getSiteDailyData')
      .mockResolvedValue({ data: [] } as never);
    vi.spyOn(siteServices, 'getSiteSurveyPoints').mockResolvedValue({
      data: [],
    } as never);
    const store = configureStore({
      reducer: { selectedSite: selectedReducer },
    });
    await store.dispatch(siteRequest({ id: '1', date: '2024-01-02' }) as never);
    expect(getSite).toHaveBeenCalledWith('1', '2024-01-02');
    expect(daily).toHaveBeenCalledWith(
      '1',
      '2023-10-05T00:00:00.000Z',
      '2024-01-02T23:59:59.999Z',
    );
    await store.dispatch(siteRequest({ id: '1', date: '2024-01-02' }) as never);
    expect(getSite).toHaveBeenCalledTimes(1);
    await store.dispatch(siteRequest('1') as never);
    expect(getSite).toHaveBeenLastCalledWith('1', undefined);
  });
});
