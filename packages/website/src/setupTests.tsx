// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import 'mutationobserver-shim';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'node:stream/web';
import React from 'react';

// Polyfill to address vi+jsdom issue: https://github.com/jsdom/jsdom/issues/2524
// Define the globals that are missing
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
});

vi.mock('@mui/icons-material', () => ({
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

vi.mock('react-chartjs-2', () => ({
  Line: 'mock-Line',
  Chart: {
    pluginService: {
      register: vi.fn(),
    },
  },
}));

vi.mock('chartjs-adapter-date-fns', () => ({
  default: 'mock-chartjs-adapter-date-fns',
}));

vi.mock('axios-cache-interceptor', async () => {
  const original = await vi.importActual('axios-cache-interceptor');
  return {
    ...original,
    // do not intercept requests with cache in tests
    setupCache: vi.fn((instance) => instance),
  };
});

/**
 * fix: `matchMedia` not present, legacy browsers require a polyfill
 */
// eslint-disable-next-line fp/no-mutation
global.matchMedia =
  global.matchMedia ||
  function () {
    return {
      matches: false,
      addListener() {},
      addEventListener() {},
      removeListener() {},
      removeEventListener() {},
    };
  };

const svgs = ['watch', 'unwatch', 'caret', 'satellite'];
svgs.forEach((svgName) => {
  vi.doMock(`assets/${svgName}.svg`, () => ({
    ReactComponent: (props: React.SVGProps<SVGSVGElement>) => (
      <svg {...props}>{`${svgName}.svg`}</svg>
    ),
    default: `${svgName}.svg`,
  }));
});

const muiComponents = [
  'Typography',
  'IconButton',
  'Avatar',
  'Box',
  'Tabs',
  'Tab',
  'AppBar',
  'Toolbar',
  'Tooltip',
  'Link',
  'Card',
  'CardContent',
  'Chip',
  'List',
  'ListItem',
  'ListItemText',
  'Menu',
  'MenuList',
  'MenuItem',
  'Modal',
  'Popover',
  'CircularProgress',
  'Hidden',
  'Accordion',
  'AccordionSummary',
  'AccordionDetails',
  'Checkbox',
  'Drawer',
  'Divider',
  'Snackbar',
  'Stepper',
  'StepButton',
  'Step',
  'Switch',
  'Dialog',
  'DialogActions',
  'DialogContent',
  'DialogContentText',
  'DialogTitle',
  'Table',
  'TableContainer',
  'TableHead',
  'TableBody',
  'TableRow',
  'TableCell',
  'TablePagination',
  'TableSortLabel',
  'Skeleton',
  'LinearProgress',
];

muiComponents.forEach(async (componentName: string) => {
  const original = await vi.importActual(`@mui/material/${componentName}`);

  vi.doMock(`@mui/material/${componentName}`, () => ({
    ...original,
    default: `mock-${componentName}`,
  }));
});

vi.doMock('@mui/material', async () => {
  const original = await vi.importActual('@mui/material');
  const mocked: Record<string, any> = {};
  muiComponents.forEach((componentName: string) => {
    // eslint-disable-next-line fp/no-mutation
    mocked[componentName] = `mock-${componentName}`;
  });
  return {
    ...original,
    ...mocked,
  };
});

vi.mock(`@mui/x-date-pickers/DatePicker`, async () => {
  const original = await vi.importActual(`@mui/x-date-pickers/DatePicker`);
  return {
    ...original,
    default: `mock-date-picker`,
    DatePicker: `mock-date-picker`,
  };
});

vi.mock(`@mui/x-date-pickers`, async () => {
  const original = await vi.importActual(`@mui/x-date-pickers`);
  return {
    ...original,
    default: `mock-date-picker`,
    DatePicker: `mock-date-picker`,
  };
});
