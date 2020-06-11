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
        height: "122px",
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
      h5: {
        fontSize: "26px",
      },
      subtitle1: {
        fontSize: "14px",
      },
      subtitle2: {
        fontSize: "12px",
      },
      caption: {
        fontSize: "10px",
      },
      gutterBottom: {
        marginBottom: "3rem",
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
        borderRadius: "5px",
      },
      containedPrimary: {
        backgroundColor: lightBlue,
      },
      containedSecondary: {
        backgroundColor: darkGreyBlue,
      },
    },
  },
});

export default theme;
