import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Monitoring from '.';

describe('Monitoring Page', () => {
  let element: HTMLElement;
  beforeEach(() => {
    element = render(
      <BrowserRouter>
        <Monitoring />
      </BrowserRouter>,
    ).container;
  });

  it('should render with given state from Redux store', () => {
    expect(element).toMatchSnapshot();
  });
});
