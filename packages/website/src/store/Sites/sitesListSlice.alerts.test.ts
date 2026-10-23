import { mockSite } from 'mocks/mockSite';
import reducer from 'store/reducer';
import { sitesToDisplayListSelector } from './sitesListSlice';

it('propagates asOf to heat-stress filtering and recomputes when only the date changes', () => {
  const initialState = reducer(undefined, { type: '@@INIT' });
  const list = [
    { ...mockSite, id: 1, collectionData: undefined },
    { ...mockSite, id: 2, collectionData: { tempWeeklyAlert: 0 } },
  ];
  const live = {
    ...initialState,
    sitesList: {
      ...initialState.sitesList,
      list,
      filters: { heatStress: { 0: true as const } },
    },
  };
  expect(sitesToDisplayListSelector(live)?.map(({ id }) => id)).toEqual([1, 2]);

  // Keep list and filters references unchanged: asOf must be a selector input.
  const historical = {
    ...live,
    sitesList: { ...live.sitesList, asOf: '2020-03-01' },
  };
  expect(sitesToDisplayListSelector(historical)?.map(({ id }) => id)).toEqual([
    2,
  ]);

  const unfilteredHistorical = {
    ...historical,
    sitesList: { ...historical.sitesList, filters: {} },
  };
  expect(
    sitesToDisplayListSelector(unfilteredHistorical)?.map(({ id }) => id),
  ).toEqual([1, 2]);

  const returnToLive = {
    ...historical,
    sitesList: { ...historical.sitesList, asOf: undefined },
  };
  expect(sitesToDisplayListSelector(returnToLive)?.map(({ id }) => id)).toEqual(
    [1, 2],
  );
});
