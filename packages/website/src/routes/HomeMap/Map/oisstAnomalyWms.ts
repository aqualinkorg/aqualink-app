import { DateTime } from 'luxon-extensions';

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
 * Daily OISST files are published under a dated path in two catalogs: the
 * final archive (`-only-dly`) and a preliminary one (`-only-dly-prelim`, which
 * carries the `..._preliminary.nc` suffix) covering only recent weeks while
 * the archive catches up.
 */
const OISST_PRELIMINARY_WINDOW_DAYS = 31;

export function buildHistoricalOisstDatasetPath(date: string): string | null {
  const day = DateTime.fromISO(date, { zone: 'UTC' });
  if (!day.isValid) return null;

  const compactDate = day.toFormat('yyyyLLdd');
  const yearMonth = day.toFormat('yyyyLL');
  const ageInDays = DateTime.utc().diff(day, 'days').days;

  return ageInDays <= OISST_PRELIMINARY_WINDOW_DAYS
    ? `ncFC/fc-oisst-daily-avhrr-only-dly-prelim/files/${yearMonth}/oisst-avhrr-v02r01.${compactDate}_preliminary.nc`
    : `ncFC/fc-oisst-daily-avhrr-only-dly/files/${yearMonth}/oisst-avhrr-v02r01.${compactDate}.nc`;
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
