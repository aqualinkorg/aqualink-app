import {
  buildOisstAnomalyWmsUrl,
  fetchHistoricalOisstWmsUrl,
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

describe('historical imagery', () => {
  afterEach(() => vi.unstubAllGlobals());
  it('resolves the selected daily dataset and forwards cancellation', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue({ ok: true, text: async () => '<Name>sst</Name>' });
    vi.stubGlobal('fetch', fetchMock);
    const controller = new AbortController();
    const url = await fetchHistoricalOisstWmsUrl(
      '2020-06-15',
      controller.signal,
    );
    expect(url).toContain('/202006/oisst-avhrr-v02r01.20200615.nc');
    expect(fetchMock).toHaveBeenCalledWith(
      `${url}?service=WMS&request=GetCapabilities`,
      { signal: controller.signal },
    );
  });
  it('does not fall back to live imagery when the historical dataset is missing', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', fetchMock);
    expect(await fetchHistoricalOisstWmsUrl('2020-06-15')).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0][0]).not.toContain('latest');
  });
  it('rejects invalid dates before fetching', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(fetchHistoricalOisstWmsUrl('2020-02-30')).rejects.toThrow(
      'Invalid historical date',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
