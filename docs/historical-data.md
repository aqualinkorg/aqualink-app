# Historical observations

The map and site pages share a **Data date (UTC)** control. Selecting a day stores `asOf=YYYY-MM-DD` in the URL; site links and the return-to-map action preserve it. **Return to current data** removes the cutoff. Invalid or future dates are rejected by the API, and invalid URL dates are identified by the selector.

The following endpoints accept the optional `asOf` query parameter:

- `GET /sites`
- `GET /sites/:id`
- `GET /sites/:id/latest_data`

Historical summaries select the latest observation before the next UTC midnight for each metric, source type, site and survey point. The existing latest-data freshness windows are applied relative to the selected day: seven days for regular observations and two years for sonde, HUI, HWO and sheet uploads. An absent historical observation stays absent. Requests without `asOf` retain the live materialized-view path. Site locations, configuration and climatology remain the site's current metadata.

The selected-site chart loads the 90 days ending on that day. Site charts, water sampling cards, survey media and survey timelines stop at the cutoff; site charts retain their existing local-time display. Changing dates resets cached observations and ignores late responses from the previous site/date while allowing concurrent requests for different metrics.

Historical map overlays use the selected NOAA OISST daily dataset for SST and anomaly when available. The current Sofar heat-stress overlay is omitted in this mode; site heat-stress markers and values come from historical observations. Missing archive imagery never falls back to current imagery. Live video, current buoy positions, forecasts and external live panels are omitted from historical views.

## Validation

Backend regression coverage lives in `src/utils/historical-data.test.ts` and `src/utils/historical-data.spec.ts`; the latter is included in the existing API application integration suite. It covers UTC boundaries, freshness, future/invalid dates, missing observations and matching map/site/latest summaries.

Frontend tests cover query-preserving navigation, date boundaries, clipped ranges, missing observations, archive imagery and overlapping requests. The map/site snapshots include the date selector with a fixed clock.
