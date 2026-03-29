import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { HomepageState } from "./types";

const initialState: HomepageState = {
  selectedDate: null,
};

const homepageSlice = createSlice({
  name: "homepage",
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string | null>) {
      state.selectedDate = action.payload;
    },
  },
});

export const { setSelectedDate } = homepageSlice.actions;
export default homepageSlice.reducer;
