import { getContrastRatio } from '@mui/material/styles';
import theme, { colors } from './theme';

it.each([
  ['body text', theme.palette.text.primary, theme.palette.background.paper],
  [
    'labels and helper text',
    theme.palette.text.secondary,
    theme.palette.background.paper,
  ],
  [
    'disabled values',
    theme.palette.text.disabled,
    theme.palette.action.disabledBackground,
  ],
  ['primary actions', '#FFFFFF', theme.palette.primary.main],
  ['dark surfaces', colors.onOcean, colors.ocean],
])('%s remains readable against its surface', (_, foreground, background) => {
  expect(getContrastRatio(foreground, background)).toBeGreaterThanOrEqual(4.5);
});
