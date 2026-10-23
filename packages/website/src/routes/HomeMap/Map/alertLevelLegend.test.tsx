import React from 'react';
import { render, screen } from '@testing-library/react';
import { ThemeProvider } from '@mui/material/styles';
import { MemoryRouter } from 'react-router-dom';
import theme from 'layout/App/theme';
import { AlertLevelLegendContent } from './alertLevelLegend';

it.each([
  ['historical', '/?asOf=2020-03-01', true],
  ['live', '/', false],
] as const)(
  'shows the appropriate availability legend in %s mode',
  (_, route, historical) => {
    render(
      <ThemeProvider theme={theme}>
        <MemoryRouter initialEntries={[route]}>
          <AlertLevelLegendContent />
        </MemoryRouter>
      </ThemeProvider>,
    );
    if (historical) {
      expect(screen.getByText('no data')).toHaveStyle({
        backgroundColor: '#767676',
      });
    } else {
      expect(screen.queryByText('no data')).toBeNull();
    }
    expect(screen.getByText('no alert')).toHaveStyle({
      backgroundColor: '#C6E5FA',
    });
    ['watch', 'warning', 'alert 1', 'alert 2'].forEach((label) =>
      expect(screen.getByText(label)).toBeInTheDocument(),
    );
  },
);
