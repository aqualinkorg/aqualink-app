export interface HomepageState {
  /**
   * ISO date string (YYYY-MM-DD) for historical map view.
   * null means "today" (live data).
   */
  selectedDate: string | null;
}
