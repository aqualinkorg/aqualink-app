import {
  foldIntoMooringTemperature,
  smartMooringValuesByPrefix,
} from './sofar';

const rows = [
  {
    data_type_name: 'bm_do_mg_per_l_mean',
    value: 6.5,
    timestamp: '2026-11-20T00:00:00.000Z',
  },
  {
    data_type_name: 'bm_do_mg_per_l_mean_2',
    value: 6.6,
    timestamp: '2026-11-20T01:00:00.000Z',
  },
  {
    data_type_name: 'bm_do_saturation_pct_mean',
    value: 90,
    timestamp: '2026-11-20T00:00:00.000Z',
  },
  {
    data_type_name: 'bm_do_quality_mean',
    value: null,
    timestamp: '2026-11-20T00:00:00.000Z',
  },
  {
    data_type_name: 'bm_do_quality',
    value: 0.2,
    timestamp: '2026-11-20T00:00:00.000Z',
  },
  {
    value: 1,
    timestamp: '2026-11-20T00:00:00.000Z',
  },
];

test('matches smart mooring dissolved oxygen rows by data_type_name prefix', () => {
  expect(smartMooringValuesByPrefix(rows, 'bm_do_mg_per_l_mean')).toEqual([
    { value: 6.5, timestamp: '2026-11-20T00:00:00.000Z' },
    { value: 6.6, timestamp: '2026-11-20T01:00:00.000Z' },
  ]);

  expect(smartMooringValuesByPrefix(rows, 'bm_do_saturation_pct_mean')).toEqual(
    [{ value: 90, timestamp: '2026-11-20T00:00:00.000Z' }],
  );

  expect(smartMooringValuesByPrefix(rows, 'bm_do_quality_mean')).toEqual([]);
});

test('keeps standard mooring temperature and skips bristlemouth rows unless asked', () => {
  expect(foldIntoMooringTemperature('sofar_temperature_12bits', false)).toBe(
    true,
  );
  expect(foldIntoMooringTemperature('bm_do_mg_per_l_mean', false)).toBe(false);
  expect(foldIntoMooringTemperature(undefined, false)).toBe(true);
  expect(foldIntoMooringTemperature('bm_do_mg_per_l_mean', true)).toBe(true);
});
