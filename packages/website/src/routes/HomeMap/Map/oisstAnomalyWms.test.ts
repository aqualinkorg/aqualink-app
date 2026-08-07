import {
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
