import {
  colors,
  ibmPlexMonoFontFamily,
  instrumentSansFontFamily,
} from 'layout/App/theme';

const styles = {
  root: {
    fontFamily: instrumentSansFontFamily,
    color: colors.navy,
    background: colors.white,
    lineHeight: 'normal',
    minWidth: 0,
    WebkitFontSmoothing: 'auto',
    MozOsxFontSmoothing: 'auto',
  },
  section: {
    maxWidth: 1200,
    margin: '0 auto',
    boxSizing: 'content-box' as const,
    padding: '88px 24px 112px',
  },
  eyebrow: {
    margin: '0 0 16px',
    fontFamily: ibmPlexMonoFontFamily,
    fontSize: 14,
    lineHeight: 'normal',
    letterSpacing: '0.06em',
    textTransform: 'uppercase' as const,
    color: colors.slateGray,
  },
  title: {
    margin: 0,
    fontFamily: 'inherit',
    fontSize: 56,
    lineHeight: 1.05,
    letterSpacing: '-0.03em',
    fontWeight: 700,
    maxWidth: 860,
  },
  intro: {
    margin: '20px 0 0',
    fontFamily: 'inherit',
    fontSize: 20,
    lineHeight: 1.55,
    letterSpacing: 'normal',
    color: colors.slateGray,
    maxWidth: 680,
  },
  menuPaper: {
    marginTop: 4,
    color: colors.white,
    background: 'rgba(40,44,50,.72)',
    WebkitBackdropFilter: 'blur(20px) saturate(160%)',
    backdropFilter: 'blur(20px) saturate(160%)',
    border: '1px solid rgba(255,255,255,.14)',
    borderRadius: 8,
    boxShadow: '0 10px 30px rgba(0,0,0,.35)',
  },
  menuList: {
    padding: 4,
  },
  menuItem: {
    minHeight: 0,
    borderRadius: 4,
    fontFamily: instrumentSansFontFamily,
    letterSpacing: 'normal',
    WebkitFontSmoothing: 'auto',
    MozOsxFontSmoothing: 'auto',
    '&.Mui-selected': {
      backgroundColor: 'transparent',
    },
    '&:hover, &.Mui-selected:hover, &.Mui-focusVisible, &.Mui-selected.Mui-focusVisible':
      {
        backgroundColor: colors.oceanBlue,
        color: colors.white,
      },
  },
};

export default styles;
