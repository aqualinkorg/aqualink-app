import { configureStore } from '@reduxjs/toolkit';
import { vi } from 'vitest';
import siteServices from 'services/siteServices';
import { mockSite } from 'mocks/mockSite';
import sitesListReducer, { sitesRequest } from './sitesListSlice';

vi.mock('services/siteServices', () => ({
  default: { getSites: vi.fn() },
}));

const getSites = vi.mocked(siteServices.getSites);

const makeStore = () =>
  configureStore({ reducer: { sitesList: sitesListReducer } });

// Resolve getSites calls manually so tests control the order responses arrive in
const deferredResponses = () => {
  const resolvers: Record<string, (tempWeeklyAlert: number) => void> = {};
  getSites.mockImplementation(
    (date?: string) =>
      new Promise((resolve) => {
        // eslint-disable-next-line fp/no-mutation
        resolvers[date ?? 'latest'] = (tempWeeklyAlert) =>
          resolve({
            data: [{ ...mockSite, collectionData: { tempWeeklyAlert } }],
          } as any);
      }),
  );
  return resolvers;
};

describe('sitesRequest', () => {
  beforeEach(() => {
    getSites.mockReset();
  });

  it('loads the latest data, then the data for a past day', async () => {
    const respond = deferredResponses();
    const store = makeStore();

    const latest = store.dispatch(sitesRequest({ date: null }) as any);
    respond.latest(1);
    await latest;
    expect(store.getState().sitesList.date).toBeNull();

    const past = store.dispatch(sitesRequest({ date: '2024-03-15' }) as any);
    expect(getSites).toHaveBeenLastCalledWith('2024-03-15');
    respond['2024-03-15'](4);
    await past;

    const { sitesList } = store.getState();
    expect(sitesList.date).toBe('2024-03-15');
    expect(sitesList.list?.[0].collectionData?.tempWeeklyAlert).toBe(4);
  });

  it('ignores a slower response for a date that is no longer selected', async () => {
    const respond = deferredResponses();
    const store = makeStore();

    const april = store.dispatch(sitesRequest({ date: '2024-04-01' }) as any);
    const may = store.dispatch(sitesRequest({ date: '2024-05-01' }) as any);
    respond['2024-05-01'](2);
    await may;
    respond['2024-04-01'](3);
    await april;

    const { sitesList } = store.getState();
    expect(sitesList.date).toBe('2024-05-01');
    expect(sitesList.list?.[0].collectionData?.tempWeeklyAlert).toBe(2);
  });

  it('keeps the selected day when a date-agnostic caller requests sites', async () => {
    const respond = deferredResponses();
    const store = makeStore();

    const past = store.dispatch(sitesRequest({ date: '2024-03-15' }) as any);
    respond['2024-03-15'](4);
    await past;

    await store.dispatch(sitesRequest() as any);
    expect(getSites).toHaveBeenCalledTimes(1);
    expect(store.getState().sitesList.date).toBe('2024-03-15');
  });
});
