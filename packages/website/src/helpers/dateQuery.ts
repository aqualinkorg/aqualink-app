/**
 * Helpers for injecting a historical date into API query parameters.
 *
 * The Aqualink API accepts `start` and `end` query params (ISO date strings)
 * to restrict data to a time range.  When the user has selected a historical
 * date we set both to that date so we get data for exactly that day.
 */

/**
 * Build an object of additional query parameters for a historical date.
 * Returns an empty object when `date` is null (live data mode).
 *
 * @param date - ISO date string (YYYY-MM-DD) or null for today
 */
export function buildDateQueryParams(
  date: string | null
): Record<string, string> {
  if (!date) return {};
  return {
    start: `${date}T00:00:00.000Z`,
    end: `${date}T23:59:59.999Z`,
  };
}

/**
 * Append historical date query params to a URL string.
 *
 * @param url   - base URL (may already contain query string)
 * @param date  - ISO date string or null
 */
export function appendDateQuery(url: string, date: string | null): string {
  if (!date) return url;
  const params = buildDateQueryParams(date);
  const separator = url.includes("?") ? "&" : "?";
  const qs = Object.entries(params)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
  return `${url}${separator}${qs}`;
}
