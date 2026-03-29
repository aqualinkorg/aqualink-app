import type { RootState } from "../rootReducer";

export const homepageSelectedDateSelector = (state: RootState): string | null =>
  state.homepage?.selectedDate ?? null;
