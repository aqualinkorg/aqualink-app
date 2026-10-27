# Historical daily snapshots

`GET /sites?date=2024-01-02` and `GET /sites/1?date=2024-01-02` return the last stored daily observation within that UTC calendar day. They do not use an earlier day or current readings when the day has no data. `historicalObservedAt` is null for an empty day. Null measurements are omitted; measured zero is retained. Degree Heating Days are divided by seven to return Degree Heating Weeks.

The website uses the same date for the map, site summary and daily chart cutoff. Current-only forecasts, sensor cards, live video and raster overlays are hidden. Names and locations remain current site metadata. This is a daily observation view, not a historical reconstruction of all site content.

## Database regression tests

The `Historical daily snapshots` workflow creates a disposable PostGIS database, runs the repository migrations, then tests real controller, validation, service and SQL behavior. It requires no sponsor credentials. Existing tests that use live services are separate.

To run locally, provide a disposable loopback PostGIS database with a name that starts with `aqualink_preflight`. Do not point the tests at a shared database. Unset SOFAR and cloud credentials. From `packages/api`, run:

```sh
NODE_ENV=test TZ=UTC AQUALINK_PREFLIGHT=1 \
TEST_DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5432/aqualink_preflight_fixture \
../../node_modules/.bin/jest --config test/jest.json --runInBand \
--runTestsByPath test/aqualink-preflight.test.ts --coverage=false
```

The password above is an example for a disposable local database. The fixture suite skips when `AQUALINK_PREFLIGHT` is not `1`, so normal test runs do not require this separate database. With the flag enabled, all database-name, loopback and credential guards remain active.
