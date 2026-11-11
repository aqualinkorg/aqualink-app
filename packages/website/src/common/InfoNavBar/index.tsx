import React, { useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Link as MuiLink,
  Menu,
  MenuItem,
  Theme,
  Tooltip,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import MenuIcon from '@mui/icons-material/Menu';
import LanguageIcon from '@mui/icons-material/Language';
import classNames from 'classnames';
import { colors, instrumentSansFontFamily } from 'layout/App/theme';
import { useGoogleTranslation } from 'utils/google-translate';
import { GaAction, GaCategory, trackButtonClick } from 'utils/google-analytics';
import infoPageStyles from '../styles/infoPageStyles';

const navLinks = [
  { label: 'Map', to: '/map' },
  { label: 'Examples', to: '/examples' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
];

const menuLinks = [...navLinks, { label: 'Register a site', to: '/register' }];

const trackNavClick = (label: string) =>
  trackButtonClick(
    GaCategory.BUTTON_CLICK,
    GaAction.NAV_BAR_BUTTON_CLICK,
    label,
  );

function InfoNavBar({
  variant = 'light',
  currentPage,
  classes,
}: InfoNavBarProps) {
  const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);
  const [, setTranslationOpen] = useGoogleTranslation();
  const isHero = variant === 'hero';

  return (
    <Box
      component="header"
      className={classNames(classes.header, { [classes.light]: !isHero })}
    >
      <Box className={isHero ? classes.heroInner : classes.inner}>
        <MuiLink
          component={Link}
          to="/"
          onClick={() => trackNavClick('Logo')}
          underline="none"
          className={classNames(classes.logo, { [classes.heroLogo]: isHero })}
        >
          Aqua
          <span
            className={isHero ? classes.heroLogoAccent : classes.logoAccent}
          >
            link
          </span>
        </MuiLink>
        <Box component="nav" aria-label="Main" className={classes.nav}>
          {navLinks.map(({ label, to }) => (
            <Button
              key={label}
              component={Link}
              to={to}
              onClick={() => trackNavClick(label)}
              aria-current={currentPage === to ? 'page' : undefined}
              className={classNames(classes.navLink, classes.desktopOnly, {
                [classes.heroNavLink]: isHero,
                [classes.activeNavLink]: currentPage === to,
              })}
            >
              {label}
            </Button>
          ))}
          <Button
            component={Link}
            to="/register"
            onClick={() => trackNavClick('Register a site')}
            className={classNames(classes.registerButton, classes.desktopOnly, {
              [classes.heroRegisterButton]: isHero,
            })}
          >
            Register a site
          </Button>
          <Tooltip title="Translate">
            <IconButton
              aria-label="Translate"
              onClick={() => {
                trackNavClick('Translate');
                setTranslationOpen(
                  document.getElementById('google_translate_element')?.style
                    .display !== 'inline',
                );
              }}
              className={classNames(classes.iconButton, {
                [classes.heroIconButton]: isHero,
              })}
            >
              <LanguageIcon />
            </IconButton>
          </Tooltip>
          <IconButton
            aria-label="Open menu"
            aria-haspopup="true"
            aria-expanded={Boolean(menuAnchor)}
            aria-controls={menuAnchor ? 'info-nav-menu' : undefined}
            onClick={(event) => setMenuAnchor(event.currentTarget)}
            className={classNames(classes.iconButton, classes.menuButton, {
              [classes.heroIconButton]: isHero,
            })}
          >
            <MenuIcon />
          </IconButton>
          <Menu
            id="info-nav-menu"
            anchorEl={menuAnchor}
            open={Boolean(menuAnchor)}
            onClose={() => setMenuAnchor(null)}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            classes={{ paper: classes.menuPaper, list: classes.menuList }}
          >
            {menuLinks.map(({ label, to }) => (
              <MenuItem
                key={label}
                component={Link}
                to={to}
                onClick={() => {
                  trackNavClick(label);
                  setMenuAnchor(null);
                }}
                className={classes.menuItem}
              >
                {label}
              </MenuItem>
            ))}
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    header: {
      fontFamily: instrumentSansFontFamily,
      lineHeight: 'normal',
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto',
    },
    light: {
      position: 'sticky',
      top: 0,
      zIndex: theme.zIndex.appBar,
      borderBottom: `1px solid ${colors.borderGray}`,
      background: colors.white,
    },
    inner: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '16px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
    },
    heroInner: {
      padding: '28px 40px',
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 16,
      [theme.breakpoints.down('md')]: {
        padding: 20,
      },
    },
    logo: {
      display: 'flex',
      alignItems: 'center',
      minHeight: 44,
      fontFamily: 'inherit',
      color: colors.navy,
      fontSize: 24,
      fontWeight: 700,
      lineHeight: 'normal',
      letterSpacing: '-0.02em',
      '&:hover': {
        color: colors.navy,
      },
    },
    heroLogo: {
      color: colors.white,
      fontSize: 26,
      '&:hover': {
        color: colors.white,
      },
    },
    logoAccent: {
      color: colors.oceanBlue,
    },
    heroLogoAccent: {
      color: colors.paleSkyBlue,
    },
    nav: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: 4,
    },
    navLink: {
      minWidth: 0,
      padding: '12px 14px',
      borderRadius: 0,
      fontFamily: 'inherit',
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      color: colors.navy,
      '&:hover': {
        color: colors.navy,
        backgroundColor: 'transparent',
      },
    },
    heroNavLink: {
      color: colors.white,
      '&:hover': {
        color: colors.white,
      },
    },
    activeNavLink: {
      color: colors.oceanBlue,
      fontWeight: 600,
      boxShadow: `inset 0 -2px 0 ${colors.oceanBlue}`,
      '&:hover': {
        color: colors.oceanBlue,
      },
    },
    registerButton: {
      minWidth: 0,
      marginLeft: 8,
      padding: '12px 18px',
      borderRadius: 8,
      fontFamily: 'inherit',
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      background: colors.oceanBlue,
      color: colors.white,
      '&:hover': {
        background: colors.oceanBlue,
        color: colors.white,
      },
    },
    heroRegisterButton: {
      padding: '12px 20px',
      borderRadius: 10,
      background: colors.white,
      color: colors.navy,
      '&:hover': {
        background: colors.white,
        color: colors.navy,
      },
    },
    desktopOnly: {
      [theme.breakpoints.down('md')]: {
        display: 'none',
      },
    },
    iconButton: {
      color: colors.navy,
    },
    heroIconButton: {
      color: colors.white,
    },
    menuButton: {
      display: 'none',
      [theme.breakpoints.down('md')]: {
        display: 'inline-flex',
      },
    },
    menuPaper: {
      ...infoPageStyles.menuPaper,
      minWidth: 200,
    },
    menuList: infoPageStyles.menuList,
    menuItem: {
      ...infoPageStyles.menuItem,
      padding: '10px 14px',
      fontSize: 16,
      fontWeight: 500,
      lineHeight: 'normal',
    },
  });

interface InfoNavBarIncomingProps {
  variant?: 'light' | 'hero';
  currentPage?: '/examples' | '/projects' | '/blog';
}

type InfoNavBarProps = InfoNavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoNavBar);
