import theme from 'layout/App/theme';

const MD_MID_POINT = 1100;
const SM_MID_POINT = 780;
const MOBILE = 350;

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
    [theme.breakpoints.between(MD_MID_POINT, 'lg')]: {
      fontSize: 8,
    },
    [theme.breakpoints.between('md', MD_MID_POINT)]: {
      fontSize: 7,
    },
    [theme.breakpoints.between('sm', SM_MID_POINT)]: {
      fontSize: 9,
    },
    [theme.breakpoints.down(MOBILE)]: {
      fontSize: 8,
    },
  },
  contentTextValues: {
    fontWeight: 300,
    [theme.breakpoints.between(MD_MID_POINT, 'lg')]: {
      fontSize: 28,
    },
    [theme.breakpoints.between('md', MD_MID_POINT)]: {
      fontSize: 24,
    },
    [theme.breakpoints.between('sm', SM_MID_POINT)]: {
      fontSize: 26,
    },
    [theme.breakpoints.down(MOBILE)]: {
      fontSize: 28,
    },
  },
  contentUnits: {
    [theme.breakpoints.between(MD_MID_POINT, 'lg')]: {
      fontSize: 14,
    },
    [theme.breakpoints.between('md', MD_MID_POINT)]: {
      fontSize: 12,
    },
    [theme.breakpoints.between('sm', SM_MID_POINT)]: {
      fontSize: 14,
    },
    [theme.breakpoints.down(MOBILE)]: {
      fontSize: 14,
    },
  },
  contentMeasure: {
    marginBottom: '1rem',
  },
};
