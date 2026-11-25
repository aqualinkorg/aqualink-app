import { parseLatestData } from './helpers';

const hoursAgo = (hours: number) =>
  new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();

const row = (
  metric: 'odo_concentration' | 'odo_saturation' | 'odo_quality',
  source: 'spotter' | 'sonde',
  ageHours: number,
  value: number,
) => ({
  timestamp: hoursAgo(ageHours),
  value,
  source,
  metric,
});

test('stale spotter dissolved oxygen does not override a fresher sonde reading', () => {
  const parsed = parseLatestData([
    row('odo_concentration', 'sonde', 1, 7.1),
    row('odo_concentration', 'spotter', 13, 4.2),
  ]);

  expect(parsed.odoConcentration?.value).toBe(7.1);
});

test('recent spotter dissolved oxygen overrides an older sonde reading', () => {
  const parsed = parseLatestData([
    row('odo_concentration', 'sonde', 2, 7.1),
    row('odo_concentration', 'spotter', 1, 4.2),
  ]);

  expect(parsed.odoConcentration?.value).toBe(4.2);
});

test('drops stale spotter dissolved oxygen quality', () => {
  const parsed = parseLatestData([row('odo_quality', 'spotter', 13, 0.2)]);

  expect(parsed.odoQuality).toBeUndefined();
});

test('keeps a sonde dissolved oxygen reading when no spotter row exists', () => {
  const parsed = parseLatestData([row('odo_saturation', 'sonde', 20, 98)]);

  expect(parsed.odoSaturation?.value).toBe(98);
});
