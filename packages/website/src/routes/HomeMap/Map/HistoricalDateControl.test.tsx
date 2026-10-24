import React from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWithProviders } from 'utils/test-utils';
import HistoricalDateControl from './HistoricalDateControl';

// The global test setup replaces MUI components with plain tags; this test
// needs the real dialog and calendar to interact with them.
vi.unmock('@mui/material');

describe('HistoricalDateControl', () => {
  it('does not show the banner for the latest data', () => {
    renderWithProviders(<HistoricalDateControl onChange={vi.fn()} />);

    expect(screen.queryByTestId('historical-date-chip')).toBeNull();
    expect(screen.getByLabelText('Select historical date')).toBeTruthy();
  });

  it('shows the selected date and goes back to the latest data', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <HistoricalDateControl date="2024-03-15" onChange={onChange} />,
    );

    const chip = screen.getByTestId('historical-date-chip');
    expect(chip.textContent).toContain('Showing Mar 15, 2024');

    fireEvent.click(chip);
    fireEvent.click(screen.getByRole('button', { name: 'Back to latest' }));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('applies a date picked in the calendar dialog', () => {
    const onChange = vi.fn();
    renderWithProviders(
      <HistoricalDateControl date="2024-03-15" onChange={onChange} />,
    );

    fireEvent.click(screen.getByLabelText('Select historical date'));
    // Unchanged date cannot be applied
    expect(
      (screen.getByRole('button', { name: 'Show date' }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);

    const dialog = within(screen.getByRole('dialog'));
    expect(dialog.getByText('March 2024')).toBeTruthy();
    fireEvent.click(dialog.getByRole('gridcell', { name: '10' }));
    fireEvent.click(dialog.getByRole('button', { name: 'Show date' }));

    expect(onChange).toHaveBeenCalledWith('2024-03-10');
  });
});
