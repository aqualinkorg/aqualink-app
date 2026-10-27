import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation, useNavigate } from 'react-router-dom';
import HistoricalDateControl from '.';

function Navigation() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <output aria-label="URL">{location.search}</output>
      <button type="button" onClick={() => navigate(-1)}>
        Back
      </button>
    </>
  );
}

it('keeps filter parameters, resets to live and follows browser history', () => {
  render(
    <MemoryRouter initialEntries={['/?site_id=1&heatStress=3&date=2024-01-01']}>
      <HistoricalDateControl />
      <Navigation />
    </MemoryRouter>,
  );
  fireEvent.change(screen.getByLabelText('Daily snapshot (UTC)'), {
    target: { value: '2024-02-29' },
  });
  expect(screen.getByLabelText('URL').textContent).toContain(
    'site_id=1&heatStress=3&date=2024-02-29',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Return to live' }));
  expect(screen.getByLabelText('URL').textContent).toBe(
    '?site_id=1&heatStress=3',
  );
  fireEvent.click(screen.getByRole('button', { name: 'Back' }));
  expect(screen.getByLabelText('Daily snapshot (UTC)')).toHaveValue(
    '2024-02-29',
  );
});
