import { createMuiTheme, Theme } from "@material-ui/core/styles";
import { MuiPickersOverrides } from "@material-ui/pickers/typings/overrides";

type OverridesNameToClassKey = {
  [P in keyof Required<MuiPickersOverrides>]: keyof MuiPickersOverrides[P];
};

declare module "@material-ui/core/styles/overrides" {
  export interface ComponentNameToClassKey extends OverridesNameToClassKey {}
}

const skyBlue = "#009ee0";
const lightBlue = "#168dbd";
const lighterBlue = "#c0e1f0";
const darkGreyBlue = "#2d3436";
const black = "#2f2f2f";
const white = "#ffffff";
const lightGray = "#939393";

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

export const colors = { skyBlue, lightBlue, lighterBlue, darkGreyBlue };

declare module "@material-ui/core/styles/createBreakpoints" {
  interface BreakpointOverrides {
    xs: true;
    sm: true;
    md: true;
    lg: true;
    xl: true;
    xxl: true;
  }
}

const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      main: lightBlue,
      dark: darkGreyBlue,
      light: white,
    },
    text: {
      primary: white,
      secondary: black,
    },
    grey: {
      500: lightGray,
    },
  },
  breakpoints: {
    values: {
      xs: 0,
      sm: 600,
      md: 960,
      lg: 1280,
      xl: 1460,
      xxl: 1920,
    },
  },
  overrides: {
    MuiAppBar: {
      root: {
        height: 122,
        justifyContent: "center",
        backgroundColor: lightBlue,
      },
    },
    MuiToolbar: {
      root: {
        justifyContent: "space-between",
      },
      dense: {
        minHeight: 40,
      },
    },
    MuiTypography: {
      h1: {
        fontSize: 52,
        fontFamily,
        fontWeight: 300,
      },
      h2: {
        fontSize: 48,
        fontFamily,
        fontWeight: 300,
      },
      h3: {
        fontSize: 32,
        fontFamily,
      },
      h4: {
        fontSize: 26,
        fontFamily,
        fontWeight: 400,
      },
      h5: {
        fontSize: 20,
        fontFamily,
      },
      h6: {
        fontSize: 16,
        fontFamily,
        fontWeight: 400,
      },
      subtitle1: {
        fontSize: 14,
        fontFamily,
      },
      subtitle2: {
        fontSize: 12,
        fontFamily,
      },
      caption: {
        fontSize: 10,
        fontFamily,
      },
      overline: {
        fontSize: 8.5,
        fontFamily,
        textTransform: "none",
      },
      gutterBottom: {
        marginBottom: "1rem",
      },
    },
    MuiGrid: {
      "spacing-xs-10": {
        width: "100%",
        margin: "0",
      },
    },
    MuiButton: {
      root: {
        borderRadius: 5,
      },
      containedPrimary: {
        backgroundColor: lightBlue,
      },
      containedSecondary: {
        backgroundColor: darkGreyBlue,
      },
    },
    MuiButtonBase: {
      root: {
        "&:focus": {
          outline: "none",
        },
      },
    },
    MuiCardContent: {
      root: {
        "&:last-child": {
          paddingBottom: 0,
        },
      },
    },
    MuiInputLabel: {
      root: {
        color: lightGray,
      },
    },
    MuiInputBase: {
      root: {
        height: "100%",
        "& $disabled": {
          backgroundColor: "#f5f5f5",
        },
      },
    },
    MuiPickersDay: {
      day: {
        color: "black",
      },
    },
    MuiPickersCalendarHeader: {
      switchHeader: {
        color: "black",
      },
    },
    MuiPickersClockNumber: {
      clockNumber: {
        color: "black",
      },
    },
    MuiOutlinedInput: {
      root: {
        padding: 0,
        color: "black",
        "&$focused": {
          borderColor: lightBlue,
        },
      },
    },
  },
});

// eslint-disable-next-line fp/no-mutation
theme.typography = {
  ...theme.typography,
  h1: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 38,
    },
  },
  h2: {
    [theme.breakpoints.down("xs")]: {
      fontSize: 34,
    },
  },
  h4: {
    [theme.breakpoints.down("sm")]: {
      fontSize: 22,
    },
  },
};

export default theme;
