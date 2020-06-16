import { createMuiTheme } from "@material-ui/core/styles";

const skyBlue: string = "#009ee0";
const lightBlue: string = "#168dbd";
const darkGreyBlue: string = "#2d3436";
const black: string = "#2f2f2f";
const white: string = "#ffffff";
const lightGray = "#cccccc";

export const colors = { skyBlue, lightBlue, darkGreyBlue };

const theme: any = createMuiTheme({
  palette: {
    primary: {
      main: lightBlue,
      dark: darkGreyBlue,
    },
    text: {
      primary: white,
      secondary: black,
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
      h3: {
        fontSize: 32,
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
