import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, Link } from 'react-router-dom';
import { useHistoricalDate } from 'hooks/useHistoricalDate';
import { withHistoricalDate } from 'helpers/historicalDate';
import HistoricalDate from '.';

function Navigation() {
  const location = useLocation();
  const asOf = useHistoricalDate();
  return (
    <>
      <HistoricalDate />
      <output>
        {location.pathname}
        {location.search}
      </output>
      <Link to={withHistoricalDate('/sites/1', asOf)}>Site</Link>
      <Link to={withHistoricalDate('/map', asOf)}>Map</Link>
    </>
  );
}
it('preserves the selected date through map/site navigation and clears it on return to current data', () => {
  render(
    <MemoryRouter initialEntries={['/map?zoom=4']}>
      <Navigation />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText('Data date (UTC)'), {
    target: { value: '2020-02-29' },
  });
  expect(screen.getByRole('status')).toHaveTextContent(
    '/map?zoom=4&asOf=2020-02-29',
  );
  fireEvent.click(screen.getByRole('link', { name: 'Site' }));
  expect(screen.getByRole('status')).toHaveTextContent(
    '/sites/1?asOf=2020-02-29',
  );
  fireEvent.click(screen.getByRole('link', { name: 'Map' }));
  expect(screen.getByLabelText('Data date (UTC)')).toHaveValue('2020-02-29');
  fireEvent.click(
    screen.getByRole('button', { name: 'Return to current data' }),
  );
  expect(screen.getByRole('status')).toHaveTextContent('/map');
  expect(screen.getByLabelText('Data date (UTC)')).toHaveValue('');
});
