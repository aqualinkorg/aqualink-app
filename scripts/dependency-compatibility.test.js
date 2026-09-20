const assert = require('node:assert/strict');
const { createRequire } = require('node:module');
const { test } = require('node:test');

const apiRequire = createRequire(
  require.resolve('../packages/api/package.json'),
);

test('Google Maps serialization never calls the vulnerable URI decoder', () => {
  const mapsRequire = createRequire(
    apiRequire.resolve('@googlemaps/google-maps-services-js'),
  );
  const queryPath = mapsRequire.resolve('query-string');
  const queryRequire = createRequire(queryPath);
  const decoderPath = queryRequire.resolve('decode-uri-component');
  const originalDecoder = queryRequire('decode-uri-component');
  const decoderModule = require.cache[decoderPath];
  decoderModule.exports = () => {
    throw new Error('URI decoder called');
  };
  try {
    const query = mapsRequire('query-string');
    // Positive control: the probe must detect the vulnerable parsing path.
    assert.throws(() => query.parse('address=%25'), /URI decoder called/);
    const { serializer } = apiRequire(
      '@googlemaps/google-maps-services-js/dist/serialize',
    );
    const serialize = serializer({}, 'https://maps.googleapis.com');
    const address = '%FE%FF'.repeat(1000);
    assert.equal(
      serialize({ address, key: 'test' }),
      `address=${encodeURIComponent(address)}&key=test`,
    );
  } finally {
    decoderModule.exports = originalDecoder;
  }
});

test('updated CSV parser preserves HOBO column mapping and casting', () => {
  const { parse } = apiRequire('csv-parse/sync');
  const records = parse('id,unused,temperature\n12,ignored,27.5\n', {
    columns: ['id', undefined, 'temperature'],
    fromLine: 2,
    cast: (value, context) =>
      ['id', 'temperature'].includes(context.column) ? Number(value) : value,
  });
  assert.deepEqual(records, [{ id: 12, temperature: 27.5 }]);
});

test('updated CSV bundle preserves objects-to-csv quoting and round trips', async () => {
  const ObjectsToCsv = apiRequire('objects-to-csv');
  const { parse } = apiRequire('csv-parse/sync');
  const records = [{ site: 'Reef, "North"', note: 'line one\nline two' }];
  const text = await new ObjectsToCsv(records).toString();
  assert.deepEqual(parse(text, { columns: true }), records);
});
