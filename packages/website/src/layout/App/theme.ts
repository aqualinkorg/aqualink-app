import { createMuiTheme } from "@material-ui/core/styles";

const skyBlue: string = "#009EE0";
const lightBlue: string = "#168DBD";
const darkGreyBlue: string = "#2D3436";
const white: string = "#FFFFFF";
const lightGray = "#CCCCCC";

export const colors = { skyBlue, lightBlue, darkGreyBlue };

const theme: any = createMuiTheme({
  palette: {
    primary: {
      main: lightBlue,
      dark: darkGreyBlue,
    },
    text: {
      primary: white,
      secondary: darkGreyBlue,
    },
    grey: {
      500: lightGray,
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
      h2: {
        fontSize: 52,
      },
      h4: {
        fontSize: 26,
      },
      h5: {
        fontSize: 20,
      },
      h6: {
        fontSize: 16,
      },
      subtitle1: {
        fontSize: 14,
      },
      subtitle2: {
        fontSize: 12,
      },
      caption: {
        fontSize: 10,
      },
      overline: {
        fontSize: 8.5,
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
    MuiCardContent: {
      root: {
        "&:last-child": {
          paddingBottom: 0,
        },
      },
    },
  },
});

export default theme;
