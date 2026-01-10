// eslint-disable-next-line import/no-extraneous-dependencies
import '@testing-library/jest-dom';
import 'mutationobserver-shim';
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream } from 'node:stream/web';
import React from 'react';
import { rstest } from '@rstest/core';

// Polyfill to address rstest+jsdom issue: https://github.com/jsdom/jsdom/issues/2524
// Define the globals that are missing
// eslint-disable-next-line fp/no-mutating-methods
Object.defineProperties(globalThis, {
  TextDecoder: { value: TextDecoder },
  TextEncoder: { value: TextEncoder },
  ReadableStream: { value: ReadableStream },
});

// Mock SVG files as fallback (SVGR plugin processes them but mocks provide test doubles)
// Note: rstest.mock() requires string literals, cannot use loops
const createSvgMock = (name: string) => ({
  ReactComponent: (props: any) => (
    <svg data-testid={`mock-${name}`} {...props}>
      {name}
    </svg>
  ),
  default: `${name}.svg`,
});

rstest.mock('assets/watch.svg', () => createSvgMock('watch'));
rstest.mock('assets/unwatch.svg', () => createSvgMock('unwatch'));
rstest.mock('assets/caret.svg', () => createSvgMock('caret'));
rstest.mock('assets/satellite.svg', () => createSvgMock('satellite'));

rstest.mock('@mui/icons-material', () => ({
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

rstest.mock('react-chartjs-2', () => ({
  Line: 'mock-Line',
  Chart: {
    pluginService: {
      register: rstest.fn(),
    },
  },
}));

rstest.mock('chartjs-adapter-date-fns', () => ({
  default: 'mock-chartjs-adapter-date-fns',
}));

rstest.mock('axios-cache-interceptor', () => {
  const original = rstest.importActual('axios-cache-interceptor');
  return {
    ...original,
    // do not intercept requests with cache in tests
    setupCache: rstest.fn((instance) => instance),
  };
});

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
