import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigationType } from 'react-router-dom';
import { useQueryParam } from './useQueryParams';

function Probe() {
  useQueryParam('start');
  useQueryParam('end');
  const { search } = useLocation();
  const navigationType = useNavigationType();
  return (
    <>
      <span data-testid="search">{search}</span>
      <span data-testid="navigation">{navigationType}</span>
    </>
  );
}

describe('useQueryParam', () => {
  it('does not push a history entry when params already match the url', () => {
    const search = '?date=2024-03-15&start=2024-02-15&end=2024-03-15';
    render(
      <MemoryRouter initialEntries={[`/sites/1${search}`]}>
        <Probe />
      </MemoryRouter>,
    );

    expect(screen.getByTestId('search').textContent).toBe(search);
    expect(screen.getByTestId('navigation').textContent).toBe('POP');
  });
});
