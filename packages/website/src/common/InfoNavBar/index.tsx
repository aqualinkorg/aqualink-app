import React from 'react';
import { Box, Button, Link as MuiLink } from '@mui/material';
import { Link } from 'react-router-dom';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import classNames from 'classnames';
import { colors, instrumentSansFontFamily } from 'layout/App/theme';

const navLinks = [
  { label: 'Map', to: '/map' },
  { label: 'Examples', to: '/examples' },
  { label: 'Projects', to: '/projects' },
  { label: 'Blog', to: '/blog' },
];

function InfoNavBar({
  variant = 'light',
  currentPage,
  classes,
}: InfoNavBarProps) {
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
              aria-current={currentPage === to ? 'page' : undefined}
              className={classNames(classes.navLink, {
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
            className={classNames(classes.registerButton, {
              [classes.heroRegisterButton]: isHero,
            })}
          >
            Register a site
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

const styles = () =>
  createStyles({
    header: {
      fontFamily: instrumentSansFontFamily,
      lineHeight: 'normal',
    },
    light: {
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
  });

interface InfoNavBarIncomingProps {
  variant?: 'light' | 'hero';
  currentPage?: '/examples' | '/projects' | '/blog';
}

type InfoNavBarProps = InfoNavBarIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoNavBar);
