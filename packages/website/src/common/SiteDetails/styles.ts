import theme from 'layout/App/theme';

// Dense metric cards shrink in the desktop grid and stack below md.

export const styles = {
  card: {
    minHeight: '18rem',
    height: '100%',
  },
  cardTitle: {
    lineHeight: 1.5,
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: 14,
    },
  },
  header: {
    padding: '0.5rem 1.5rem 0 1rem',
  },
  contentTextTitles: {
    lineHeight: 1.33,
    fontSize: 10,
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: 8,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 9,
    },
  },
  contentTextValues: {
    fontWeight: 300,
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: 28,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 28,
    },
  },
  contentUnits: {
    [theme.breakpoints.between('md', 'lg')]: {
      fontSize: 14,
    },
    [theme.breakpoints.down('md')]: {
      fontSize: 14,
    },
  },
  contentMeasure: {
    marginBottom: '1rem',
  },
};
