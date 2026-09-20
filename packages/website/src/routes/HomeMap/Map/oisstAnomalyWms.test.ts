import { DateTime } from 'luxon-extensions';
import {
  buildHistoricalOisstDatasetPath,
  buildOisstAnomalyWmsUrl,
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

describe('buildHistoricalOisstDatasetPath', () => {
  it('uses the final archive for dates older than the preliminary window', () => {
    expect(buildHistoricalOisstDatasetPath('2020-01-15')).toBe(
      'ncFC/fc-oisst-daily-avhrr-only-dly/files/202001/oisst-avhrr-v02r01.20200115.nc',
    );
  });

  it('uses the preliminary catalog for recent dates', () => {
    const yesterday = DateTime.utc().minus({ days: 1 });
    expect(
      buildHistoricalOisstDatasetPath(yesterday.toFormat('yyyy-MM-dd')),
    ).toBe(
      `ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/${yesterday.toFormat(
        'yyyyLL',
      )}/oisst-avhrr-v02r01.${yesterday.toFormat('yyyyLLdd')}_preliminary.nc`,
    );
  });

  it('returns null for an invalid date', () => {
    expect(buildHistoricalOisstDatasetPath('not-a-date')).toBeNull();
  });
});
