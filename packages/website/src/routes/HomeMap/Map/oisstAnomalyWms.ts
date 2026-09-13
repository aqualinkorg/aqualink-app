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
