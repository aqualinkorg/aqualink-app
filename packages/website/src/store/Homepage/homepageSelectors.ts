import type { RootState } from "../configure";

export const homepageSelectedDateSelector = (state: RootState): string | null =>
  state.homepage?.selectedDate ?? null;
