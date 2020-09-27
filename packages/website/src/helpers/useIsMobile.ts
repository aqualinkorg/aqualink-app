import { useMediaQuery, useTheme } from "@material-ui/core";

export function useIsMobile(): boolean {
  const theme = useTheme();
  return useMediaQuery(theme.breakpoints.down("xs"));
}
