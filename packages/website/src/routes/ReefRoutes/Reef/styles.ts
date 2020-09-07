import theme from "../../../layout/App/theme";

export const styles = {
  contentTextTitles: {
    lineHeight: 1.33,
    [theme.breakpoints.between("sm", 740)]: {
      fontSize: 9,
    },
    [theme.breakpoints.between("md", "lg")]: {
      fontSize: 9,
    },
    [theme.breakpoints.down(380)]: {
      fontSize: 11,
    },
  },
  contentTextValues: {
    fontWeight: 300,
    fontSize: 32,
    [theme.breakpoints.between("sm", 740)]: {
      fontSize: 28,
    },
    [theme.breakpoints.between("md", "lg")]: {
      fontSize: 24,
    },
  },
  contentUnits: {
    [theme.breakpoints.between("md", "lg")]: {
      fontSize: 12,
    },
    [theme.breakpoints.between("sm", 740)]: {
      fontSize: 12,
    },
  },
  contentMeasure: {
    marginBottom: "1rem",
  },
};
