'use client';

import { createTheme, Theme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';

const skyBlue = '#009ee0';
const lightBlue = '#168dbd';
const lighterBlue = '#c0e1f0';
const darkGreyBlue = '#2d3436';
const black = '#2f2f2f';
const white = '#ffffff';
const lightGray = '#939393';
const specialSensorColor = '#f78c21';
const greenCardColor = '#37a692';
const backgroundGray = '#f5f5f5';

const fontFamily =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif";

export const randomColors = [
  '#25CCF7',
  '#FD7272',
  '#54a0ff',
  '#00d2d3',
  '#1abc9c',
  '#2ecc71',
  '#3498db',
  '#9b59b6',
  '#34495e',
  '#16a085',
];

export const colors = {
  skyBlue,
  lightBlue,
  lighterBlue,
  darkGreyBlue,
  black,
  specialSensorColor,
  greenCardColor,
  backgroundGray,
};

export const mapIconSize = '2rem';

const theme: Theme = createTheme({
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
});

theme.components = {
  MuiAppBar: {
    styleOverrides: {
      root: {
        height: 122,
        justifyContent: 'center',
        backgroundColor: lightBlue,
      },
    },
  },
  MuiToolbar: {
    styleOverrides: {
      root: {
        justifyContent: 'space-between',
      },
      dense: {
        minHeight: 40,
      },
    },
  },
  MuiTypography: {
    styleOverrides: {
      h1: {
        fontSize: 52,
        fontFamily,
        fontWeight: 300,
        [theme.breakpoints.down('xs')]: {
          fontSize: 34,
        },
      },
      h2: {
        fontSize: 48,
        fontFamily,
        fontWeight: 300,
        [theme.breakpoints.down('xs')]: {
          fontSize: 30,
        },
      },
      h3: {
        fontSize: 32,
        fontFamily,
      },
      h4: {
        fontSize: 26,
        fontFamily,
        fontWeight: 400,
        [theme.breakpoints.down('sm')]: {
          fontSize: 22,
        },
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
        textTransform: 'none',
      },
      gutterBottom: {
        marginBottom: '1rem',
      },
    },
  },
  MuiGrid: {
    styleOverrides: {
      'spacing-xs-10': {
        width: '100%',
        margin: '0',
      },
    },
  },
  MuiButton: {
    styleOverrides: {
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
  },
  MuiButtonBase: {
    styleOverrides: {
      root: {
        '&:focus': {
          outline: 'none',
        },
      },
    },
  },
  MuiCardContent: {
    styleOverrides: {
      root: {
        '&:last-child': {
          paddingBottom: 0,
        },
      },
    },
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        color: lightGray,
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        height: '100%',
        '& .Mui-disabled': {
          backgroundColor: backgroundGray,
        },
      },
    },
  },
  MuiDatePicker: {
    styleOverrides: {
      root: {
        color: black,
      },
      textFiled: {
        color: black,
      },
    },
  },
  MuiPickersDay: {
    styleOverrides: {
      root: {
        color: 'black',
      },
    },
  },
  MuiPickersCalendarHeader: {
    styleOverrides: {
      root: {
        color: 'black',
      },
    },
  },
  MuiClockNumber: {
    styleOverrides: {
      root: {
        color: 'black',
      },
    },
  },
  MuiYearPicker: {
    styleOverrides: {
      root: {
        color: 'black',
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        color: 'black',
        '&:not(.MuiInputBase-multiline)': {
          padding: 0,
        },
        '&.Mui-focused': {
          borderColor: lightBlue,
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        color: black,
      },
      head: {
        color: black,
      },
      body: {
        color: black,
      },
    },
  },
  MuiTableSortLabel: {
    styleOverrides: {
      root: {
        color: black,
        '&.Mui-active': {
          color: `${black} !important`,
        },
      },
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: {
        color: black,
        backgroundColor: backgroundGray,
      },
      menuItem: {
        color: black,
      },
    },
  },
};

export default theme;
