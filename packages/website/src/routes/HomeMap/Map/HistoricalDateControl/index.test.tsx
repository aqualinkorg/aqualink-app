import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material';
import theme from 'layout/App/theme';
import HistoricalDateControl from '.';

const renderControl = (props: { date?: string; onChange: () => void }) =>
  render(
    <ThemeProvider theme={theme}>
      <HistoricalDateControl {...props} />
    </ThemeProvider>,
  );

describe('HistoricalDateControl', () => {
  it('shows no date chip for the latest data', () => {
    renderControl({ onChange: vi.fn() });
    expect(screen.queryByTestId('historical-date-chip')).toBeNull();
    expect(screen.getByLabelText('Select a date')).toBeTruthy();
  });

  it('shows the selected date and resets to the latest data', () => {
    const onChange = vi.fn();
    renderControl({ date: '2024-03-15', onChange });

    // Chip is mocked in setupTests, so check the label it receives.
    expect(
      screen.getByTestId('historical-date-chip').getAttribute('label'),
    ).toBe('Showing data for Mar 15, 2024');
    fireEvent.click(screen.getByLabelText('Select a date'));
    fireEvent.click(screen.getByText('Show latest data'));
    expect(onChange).toHaveBeenCalledWith(undefined);
  });

  it('selects a day from the calendar', () => {
    const onChange = vi.fn();
    renderControl({ date: '2024-03-15', onChange });

    fireEvent.click(screen.getByLabelText('Select a date'));
    fireEvent.click(screen.getByRole('gridcell', { name: '10' }));
    expect(onChange).toHaveBeenCalledWith('2024-03-10');
  });
});
