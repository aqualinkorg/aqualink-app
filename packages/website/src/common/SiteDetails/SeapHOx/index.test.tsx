import React from 'react';
import { render } from '@testing-library/react';

import { parseLatestData } from 'store/Sites/helpers';
import { mockSite } from 'mocks/mockSite';
import { mockLatestData } from 'mocks/mockLatestData';
import SeapHOxCard from './index';

describe('SeapHOx Card', () => {
  let element: HTMLElement;

  const data = parseLatestData(mockLatestData);

  beforeEach(() => {
    element = render(
      <SeapHOxCard depth={mockSite.depth} data={data} />,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
