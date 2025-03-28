// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom/';
import 'mutationobserver-shim';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'node:stream/web';

// Polyfill to address Jest+jsdom issue: https://github.com/jsdom/jsdom/issues/2524
// Define the globals that are missing
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
});

jest.mock('@mui/icons-material', () => ({
  __esModule: true,
  ArrowBack: 'mock-ArrowBack',
  Build: 'mock-Build',
  Cancel: 'mock-Cancel',
  Clear: 'mock-Clear',
  CloseOutlined: 'mock-CloseOutlined',
  Code: 'mock-Code',
  Email: 'mock-Email',
  ExpandMore: 'mock-ExpandMore',
  Favorite: 'mock-Favorite',
  FavoriteBorder: 'mock-FavoriteBorder',
  FilterHdr: 'mock-FilterHdr',
  Flag: 'mock-Flag',
  GitHub: 'mock-GitHub',
  KeyboardDoubleArrowDown: 'mock-KeyboardDoubleArrowDown',
  KeyboardArrowDown: 'mock-KeyboardArrowDown',
  KeyboardArrowUp: 'mock-KeyboardArrowUp',
  ArrowDownward: 'mock-ArrowDownward',
  ArrowUpward: 'mock-ArrowUpward',
  LocalOffer: 'mock-LocalOffer',
  Menu: 'mock-Menu',
  MoreVert: 'mock-MoreVert',
  OpenInNew: 'mock-OpenInNew',
  Person: 'mock-Person',
  Share: 'mock-Share',
  Star: 'mock-Star',
  StarBorder: 'mock-StarBorder',
  Tune: 'mock-Tune',
  ZoomOutMap: 'mock-ZoomOutMap',
}));

jest.mock('react-chartjs-2', () => ({
  Line: 'mock-Line',
  Chart: {
    pluginService: {
      register: jest.fn(),
    },
  },
}));

jest.mock('chartjs-adapter-date-fns', () => ({
  __esModule: true,
  default: 'mock-chartjs-adapter-date-fns',
}));

jest.mock('axios-cache-interceptor', () => ({
  __esModule: true,
  ...jest.requireActual('axios-cache-interceptor'),
  // do not intercept requests with cache in tests
  setupCache: jest.fn((instance) => instance),
}));

function stubMuiComponent(componentName: string, namedExports: any = {}) {
  jest.doMock(`@mui/material/${componentName}`, () => ({
    ...jest.requireActual(`@mui/material/${componentName}`),
    __esModule: true,
    default: `mock-${componentName}`,
    ...namedExports,
  }));
}

/**
 * fix: `matchMedia` not present, legacy browsers require a polyfill
 */
// eslint-disable-next-line fp/no-mutation
global.matchMedia =
  global.matchMedia ||
  // eslint-disable-next-line func-names
  function () {
    return {
      matches: false,
      addListener() {},
      addEventListener() {},
      removeListener() {},
      removeEventListener() {},
    };
  };

// eslint-disable-next-line fp/no-mutation
process.env.REACT_APP_API_BASE_URL =
  'https://programize-dot-ocean-systems.uc.r.appspot.com/api/';

// TODO: find a way to un-mock (or mock) these per test
stubMuiComponent('Typography');
// stubMuiComponent('Button', {
//   styles: jest.requireActual('@mui/material/Button/Button').styles,
// });
stubMuiComponent('IconButton');
// stubMuiComponent('TextField');
stubMuiComponent('Avatar');
stubMuiComponent('Box');
stubMuiComponent('Tabs');
stubMuiComponent('Tab');
stubMuiComponent('AppBar');
stubMuiComponent('Toolbar');
stubMuiComponent('Tooltip');
stubMuiComponent('Link');
stubMuiComponent('Card');
stubMuiComponent('CardContent');
stubMuiComponent('Chip');
stubMuiComponent('List');
stubMuiComponent('ListItem');
stubMuiComponent('ListItemText');
stubMuiComponent('Menu');
stubMuiComponent('MenuList');
stubMuiComponent('MenuItem');
stubMuiComponent('Modal');
stubMuiComponent('Popover');
stubMuiComponent('CircularProgress');
stubMuiComponent('Hidden');
stubMuiComponent('Accordion');
stubMuiComponent('AccordionSummary');
stubMuiComponent('AccordionDetails');
stubMuiComponent('Checkbox');
stubMuiComponent('Drawer');
stubMuiComponent('Divider');
stubMuiComponent('Snackbar');
stubMuiComponent('Stepper');
stubMuiComponent('StepButton');
stubMuiComponent('Step');
stubMuiComponent('Switch');
stubMuiComponent('Dialog');
stubMuiComponent('DialogActions');
stubMuiComponent('DialogContent');
stubMuiComponent('DialogContentText');
stubMuiComponent('DialogTitle');
stubMuiComponent('Table');
stubMuiComponent('TableContainer');
stubMuiComponent('TableHead');
stubMuiComponent('TableBody');
stubMuiComponent('TableRow');
stubMuiComponent('TableCell');
stubMuiComponent('TablePagination');
stubMuiComponent('TableSortLabel');

jest.doMock(`@mui/x-date-pickers/DatePicker`, () => ({
  ...jest.requireActual(`@mui/x-date-pickers/DatePicker`),
  __esModule: true,
  default: `mock-date-picker`,
  DatePicker: `mock-date-picker`,
}));
