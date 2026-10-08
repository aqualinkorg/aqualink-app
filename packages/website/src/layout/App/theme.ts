import { pink } from '@mui/material/colors';
import { createTheme, hexToRgb, Theme } from '@mui/material/styles';
import type {} from '@mui/x-date-pickers/themeAugmentation';
import layoutTokens from '../../styles/tokens.json';

const ocean = '#082D3C';
const aqualink = '#168DBD';
const sky = '#8AC6DE';
const mist = '#E8F1F3';
const paper = '#F5F8F8';
const text = '#536F79';
const specialSensorColor = '#f78c21';
const greenCardColor = '#37a692';

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
  ocean,
  aqualink,
  sky,
  mist,
  paper,
  text,
  specialSensorColor,
  greenCardColor,
};

export const mapIconSize = '2rem';

const theme: Theme = createTheme({
  breakpoints: { values: layoutTokens.breakpoints },
  palette: {
    primary: {
      main: aqualink,
      dark: ocean,
      light: paper,
    },
    secondary: {
      main: pink[500],
    },
    text: {
      primary: mist,
      secondary: text,
    },
    grey: {
      500: mist,
    },
  },
});

theme.components = {
  MuiContainer: {
    styleOverrides: {
      root: {
        width: '100%',
        maxWidth: 'calc(var(--content-max-width) + 2 * var(--page-gutter))',
        paddingLeft: 'var(--page-gutter)',
        paddingRight: 'var(--page-gutter)',
        [theme.breakpoints.up('sm')]: {
          paddingLeft: 'var(--page-gutter)',
          paddingRight: 'var(--page-gutter)',
        },
      },
      maxWidthLg: {
        [theme.breakpoints.up('lg')]: {
          maxWidth: 'calc(var(--content-max-width) + 2 * var(--page-gutter))',
        },
      },
      maxWidthXl: {
        [theme.breakpoints.up('xl')]: {
          maxWidth: 'calc(var(--content-max-width) + 2 * var(--page-gutter))',
        },
      },
    },
  },
  MuiAppBar: {
    styleOverrides: {
      root: {
        height: 122,
        justifyContent: 'center',
        backgroundColor: aqualink,
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
        [theme.breakpoints.down('sm')]: {
          fontSize: 34,
        },
      },
      h2: {
        fontSize: 48,
        fontFamily,
        fontWeight: 300,
        [theme.breakpoints.down('sm')]: {
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
        backgroundColor: aqualink,
      },
      containedSecondary: {
        backgroundColor: ocean,
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
        color: mist,
      },
    },
  },
  MuiInputBase: {
    styleOverrides: {
      root: {
        height: '100%',
        color: text,
        '& .Mui-disabled': {
          backgroundColor: text,
        },
      },
    },
  },
  MuiDateCalendar: {
    styleOverrides: {
      root: {
        color: text,
      },
    },
  },
  MuiPickersLayout: {
    styleOverrides: {
      root: {
        color: text,
      },
    },
  },
  MuiPickersDay: {
    styleOverrides: {
      root: {
        color: 'text',
      },
    },
  },
  MuiPickersCalendarHeader: {
    styleOverrides: {
      root: {
        color: 'text',
      },
    },
  },
  MuiClockNumber: {
    styleOverrides: {
      root: {
        color: 'text',
      },
    },
  },
  MuiYearCalendar: {
    styleOverrides: {
      root: {
        color: 'text',
      },
    },
  },

  MuiOutlinedInput: {
    styleOverrides: {
      root: {
        color: 'text',
        '&:not(.MuiInputBase-multiline):not(.MuiInputBase-adornedEnd)': {
          padding: 0,
        },
        '&.Mui-focused': {
          borderColor: aqualink,
        },
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        color: text,
      },
      head: {
        color: text,
      },
      body: {
        color: text,
      },
    },
  },
  MuiTableSortLabel: {
    styleOverrides: {
      root: {
        color: text,
        '&.Mui-active': {
          color: `${text} !important`,
        },
      },
    },
  },
  MuiTablePagination: {
    styleOverrides: {
      root: {
        color: text,
        backgroundColor: text,
      },
      menuItem: {
        color: text,
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        color: text,
      },
    },
  },
};

// Sass consumes the same colors as MUI, including RGB channels for transparency.
export const themeCssVariables = Object.fromEntries(
  Object.entries({ ...colors, ...theme.palette.common }).flatMap(
    ([name, value]) => [
      [`--color-${name}`, value],
      [`--color-${name}-rgb`, hexToRgb(value).slice(4, -1)],
    ],
  ),
);

export default theme;
