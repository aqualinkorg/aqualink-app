import { vi } from 'vitest';

import {
  buildOisstAnomalyProbeUrl,
  buildOisstAnomalyWmsUrl,
  fetchOisstAnomalyWmsUrlForDate,
  oisstPreliminaryDatasetPathForDate,
  parseLatestOisstDatasetPath,
} from './oisstAnomalyWms';

const SAMPLE_LATEST_CATALOG = `<?xml version="1.0" encoding="UTF-8"?>
<catalog xmlns="http://www.unidata.ucar.edu/namespaces/thredds/InvCatalog/v1.0">
  <dataset name="Latest"
    ID="ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202607/oisst-avhrr-v02r01.20260728_preliminary.nc"
    urlPath="ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202607/oisst-avhrr-v02r01.20260728_preliminary.nc">
  </dataset>
</catalog>`;

describe('parseLatestOisstDatasetPath', () => {
  it('extracts urlPath of latest daily NetCDF', () => {
    expect(parseLatestOisstDatasetPath(SAMPLE_LATEST_CATALOG)).toBe(
      'ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202607/oisst-avhrr-v02r01.20260728_preliminary.nc',
    );
  });

  it('returns null when catalog has no dataset path', () => {
    expect(parseLatestOisstDatasetPath('<catalog></catalog>')).toBeNull();
  });
});

describe('buildOisstAnomalyWmsUrl', () => {
  it('builds WMS URL for daily file with anomaly color scale', () => {
    expect(
      buildOisstAnomalyWmsUrl(
        'ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202607/oisst-avhrr-v02r01.20260728_preliminary.nc',
      ),
    ).toBe(
      'https://www.ncei.noaa.gov/thredds/wms/ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202607/oisst-avhrr-v02r01.20260728_preliminary.nc?COLORSCALERANGE=-5,5',
    );
  });
});

describe('oisstPreliminaryDatasetPathForDate', () => {
  it('builds the dataset path for an ISO date', () => {
    expect(oisstPreliminaryDatasetPathForDate('2022-09-01')).toBe(
      'ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202209/oisst-avhrr-v02r01.20220901_preliminary.nc',
    );
  });

  it('returns null for invalid dates', () => {
    expect(oisstPreliminaryDatasetPathForDate('not-a-date')).toBeNull();
    expect(oisstPreliminaryDatasetPathForDate('2022-9-1')).toBeNull();
    expect(oisstPreliminaryDatasetPathForDate('')).toBeNull();
  });
});

describe('buildOisstAnomalyProbeUrl', () => {
  it('asks for the same layer and style the map requests, at 1x1', () => {
    const url = new URL(
      buildOisstAnomalyProbeUrl(
        'ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202610/oisst-avhrr-v02r01.20261003_preliminary.nc',
        '2026-10-03',
      ),
    );

    expect(url.searchParams.get('request')).toBe('GetMap');
    expect(url.searchParams.get('layers')).toBe('anom');
    expect(url.searchParams.get('styles')).toBe('raster/x-Sst');
    expect(url.searchParams.get('width')).toBe('1');
    expect(url.searchParams.get('time')).toBe('2026-10-03T12:00:00Z');
  });
});

describe('fetchOisstAnomalyWmsUrlForDate', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns the WMS url when NCEI still serves that day', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    const url = await fetchOisstAnomalyWmsUrlForDate('2026-10-03');

    expect(url).toBe(
      buildOisstAnomalyWmsUrl(
        'ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/202610/oisst-avhrr-v02r01.20261003_preliminary.nc',
      ),
    );
  });

  it('returns null instead of a blank layer when the day is no longer archived', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: false } as unknown as Response);
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchOisstAnomalyWmsUrlForDate('2022-09-01')).resolves.toBeNull();
  });

  it('does not probe when the date is not an ISO day', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(fetchOisstAnomalyWmsUrlForDate('2022-9-1')).resolves.toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
