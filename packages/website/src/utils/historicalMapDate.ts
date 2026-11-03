export interface HistoricalDateWindow {
  dateString: string;
  startOfDayIso: string;
  endOfDayIso: string;
  isHistorical: boolean;
}

const ISO_DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Parses and validates a `YYYY-MM-DD` date parameter for the Aqualink map and site pages.
 * Defaults to today's UTC date when omitted or invalid.
 */
export function parseHistoricalMapDate(
  rawDateParam?: string | null,
  now: Date = new Date()
): HistoricalDateWindow {
  const todayStr = now.toISOString().slice(0, 10);
  if (!rawDateParam || !ISO_DATE_RE.test(rawDateParam.trim())) {
    return {
      dateString: todayStr,
      startOfDayIso: `${todayStr}T00:00:00.000Z`,
      endOfDayIso: `${todayStr}T23:59:59.999Z`,
      isHistorical: false,
    };
  }

  const candidate = rawDateParam.trim();
  const parsed = new Date(`${candidate}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime()) || candidate > todayStr) {
    return {
      dateString: todayStr,
      startOfDayIso: `${todayStr}T00:00:00.000Z`,
      endOfDayIso: `${todayStr}T23:59:59.999Z`,
      isHistorical: false,
    };
  }

  return {
    dateString: candidate,
    startOfDayIso: `${candidate}T00:00:00.000Z`,
    endOfDayIso: `${candidate}T23:59:59.999Z`,
    isHistorical: candidate !== todayStr,
  };
}
