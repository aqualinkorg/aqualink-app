const NCEI_THREDDS_BASE = 'https://www.ncei.noaa.gov/thredds';

/** Catalog that resolves to the newest preliminary daily OISST NetCDF. */
export const NCEI_OISST_LATEST_CATALOG_URL = `${NCEI_THREDDS_BASE}/catalog/ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/latest.xml`;

/**
 * Feature-collection "best" WMS returns blank tiles; daily files work.
 * Parse the latest.xml catalog for that daily dataset path.
 */
export function parseLatestOisstDatasetPath(catalogXml: string): string | null {
  const match = catalogXml.match(/urlPath="([^"]+\.nc)"/);
  return match?.[1] ?? null;
}

export function buildOisstAnomalyWmsUrl(datasetPath: string): string {
  return `${NCEI_THREDDS_BASE}/wms/${datasetPath}?COLORSCALERANGE=-5,5`;
}

/**
 * Daily preliminary files follow a deterministic naming scheme, so the
 * dataset path for a past date can be built without querying the catalog:
 * `files/YYYYMM/oisst-avhrr-v02r01.YYYYMMDD_preliminary.nc`.
 * Returns null when `date` is not an ISO `yyyy-MM-dd` string.
 */
export function oisstPreliminaryDatasetPathForDate(
  date: string,
): string | null {
  const compact = date.replace(/-/g, '');
  if (!/^\d{8}$/.test(compact)) {
    return null;
  }
  const yearMonth = compact.slice(0, 6);
  return `ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/${yearMonth}/oisst-avhrr-v02r01.${compact}_preliminary.nc`;
}

export async function fetchLatestOisstAnomalyWmsUrl(
  signal?: AbortSignal,
): Promise<string | null> {
  const response = await fetch(NCEI_OISST_LATEST_CATALOG_URL, { signal });
  if (!response.ok) {
    return null;
  }
  const catalogXml = await response.text();
  const datasetPath = parseLatestOisstDatasetPath(catalogXml);
  return datasetPath ? buildOisstAnomalyWmsUrl(datasetPath) : null;
}

/**
 * A 1x1 GetMap against the same layer and style the map requests. NCEI only
 * keeps the most recent daily preliminary files, so this is how a date that is
 * no longer served is told apart from one that is.
 */
export function buildOisstAnomalyProbeUrl(
  datasetPath: string,
  date: string,
): string {
  const params = new URLSearchParams({
    service: 'WMS',
    version: '1.3.0',
    request: 'GetMap',
    layers: 'anom',
    styles: 'raster/x-Sst',
    crs: 'EPSG:4326',
    bbox: '0,0,1,1',
    width: '1',
    height: '1',
    format: 'image/png',
    time: `${date}T12:00:00Z`,
  });
  return `${NCEI_THREDDS_BASE}/wms/${datasetPath}?${params.toString()}`;
}

export async function fetchOisstAnomalyWmsUrlForDate(
  date: string,
  signal?: AbortSignal,
): Promise<string | null> {
  const datasetPath = oisstPreliminaryDatasetPathForDate(date);
  if (!datasetPath) {
    return null;
  }

  const response = await fetch(buildOisstAnomalyProbeUrl(datasetPath, date), {
    signal,
  });
  return response.ok ? buildOisstAnomalyWmsUrl(datasetPath) : null;
}
