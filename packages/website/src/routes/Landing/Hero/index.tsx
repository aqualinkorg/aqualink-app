import React, { useState } from 'react';
import {
  Box,
  Button,
  FormLabel,
  MenuItem,
  Select,
  Theme,
  Typography,
} from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import InfoNavBar from 'common/InfoNavBar';
import { colors, instrumentSansFontFamily } from 'layout/App/theme';
import { ReactComponent as ChevronIcon } from 'assets/img/landing-page/icon-chevron-down.svg';
import heroImage from '../../../assets/img/landing-page/hero-clownfish.jpg';
import { searchFields, SearchFieldName } from '../titles';

function Hero({ classes }: HeroProps) {
  const [searchValues, setSearchValues] = useState<
    Record<SearchFieldName, string>
  >({ heatStress: '', siteOptions: '' });

  return (
    <Box className={classes.wrapper}>
      <Box className={classes.hero}>
        <InfoNavBar variant="hero" />
        <Box className={classes.content}>
          <Typography variant="h1" className={classes.title}>
            Real-time monitoring for the world&apos;s reefs
          </Typography>
          <Box
            component="form"
            action="/map"
            method="get"
            role="search"
            className={classes.search}
          >
            <Box>
              <Typography variant="h2" className={classes.searchTitle}>
                Find a reef
              </Typography>
              <Typography className={classes.searchText}>
                Filter monitored sites by heat stress and installed sensors
              </Typography>
            </Box>
            <Box className={classes.searchFields}>
              {searchFields.map(({ id, name, label, options }) => (
                <Box key={id}>
                  <FormLabel id={`${id}-label`} className={classes.label}>
                    {label}
                  </FormLabel>
                  <Select
                    id={id}
                    labelId={`${id}-label`}
                    name={searchValues[name] ? name : undefined}
                    value={searchValues[name]}
                    onChange={(event) => {
                      const { value } = event.target;
                      setSearchValues((prev) => ({ ...prev, [name]: value }));
                    }}
                    displayEmpty
                    variant="standard"
                    disableUnderline
                    IconComponent={ChevronIcon}
                    className={classes.select}
                    classes={{
                      select: classes.selectInput,
                      icon: classes.icon,
                    }}
                    MenuProps={{
                      classes: {
                        paper: classes.menuPaper,
                        list: classes.menuList,
                      },
                    }}
                  >
                    {options.map((option) => (
                      <MenuItem
                        key={option.value}
                        value={option.value}
                        className={classes.menuItem}
                      >
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </Box>
              ))}
            </Box>
            <Button type="submit" className={classes.searchButton}>
              Show Map
            </Button>
          </Box>
          <Typography className={classes.text}>
            A free, open-source tool for people on the front lines of ocean
            conservation: satellite data, in-water sensors and field surveys for
            every reef, in one app.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    wrapper: {
      color: colors.white,
      background: colors.white,
      padding: 20,
      minWidth: 0,
      [theme.breakpoints.down('sm')]: {
        padding: 12,
      },
    },
    hero: {
      position: 'relative',
      borderRadius: 32,
      overflow: 'hidden',
      minHeight: 852,
      display: 'flex',
      flexDirection: 'column',
      backgroundImage: `linear-gradient(90deg, rgba(6,20,30,.55) 0%, rgba(6,20,30,.25) 40%, rgba(6,20,30,0) 65%), linear-gradient(180deg, rgba(6,20,30,.35) 0%, rgba(6,20,30,0) 30%, rgba(6,20,30,0) 75%, rgba(6,20,30,.35) 100%), url("${heroImage}")`,
      backgroundSize: 'auto, auto, 135%',
      backgroundPosition: '0 0, 0 0, 0% 50%',
      backgroundRepeat: 'no-repeat',
      backgroundColor: colors.navy,
      [theme.breakpoints.down('md')]: {
        minHeight: 0,
        backgroundSize: 'auto, auto, cover',
        backgroundPosition: '0 0, 0 0, center',
      },
    },
    content: {
      padding: '28px 40px 48px',
      flex: '1 1 auto',
      [theme.breakpoints.down('md')]: {
        padding: '12px 20px 40px',
      },
    },
    title: {
      margin: 0,
      fontFamily: 'inherit',
      fontSize: 96,
      lineHeight: 0.98,
      letterSpacing: '-0.04em',
      fontWeight: 500,
      maxWidth: 900,
      textShadow: '0 2px 30px rgba(0,0,0,.25)',
      [theme.breakpoints.down('md')]: {
        fontSize: 56,
      },
    },
    search: {
      width: 520,
      maxWidth: '100%',
      boxSizing: 'border-box',
      marginTop: 40,
      padding: 28,
      borderRadius: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
      background: 'rgba(255,255,255,.06)',
      WebkitBackdropFilter: 'blur(6px)',
      backdropFilter: 'blur(6px)',
      border: '1px solid rgba(255,255,255,.35)',
      [theme.breakpoints.down('md')]: {
        width: 'auto',
      },
      [theme.breakpoints.down('sm')]: {
        padding: 20,
      },
    },
    searchTitle: {
      margin: 0,
      fontFamily: 'inherit',
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.15,
    },
    searchText: {
      margin: '6px 0 0',
      fontFamily: 'inherit',
      fontSize: 15,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: 'rgba(255,255,255,.85)',
    },
    searchFields: {
      display: 'grid',
      gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
      gap: 12,
      [theme.breakpoints.down('sm')]: {
        gridTemplateColumns: 'minmax(0, 1fr)',
      },
    },
    label: {
      display: 'block',
      marginBottom: 8,
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 500,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.white,
      '&.Mui-focused': {
        color: colors.white,
      },
    },
    select: {
      display: 'flex',
      width: '100%',
      height: 'auto',
      boxSizing: 'border-box',
      fontFamily: 'inherit',
      fontSize: 16,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.white,
      background: 'rgba(255,255,255,.08)',
      border: '1px solid rgba(255,255,255,.4)',
      borderRadius: 12,
    },
    selectInput: {
      '&&&': {
        height: 'auto',
        minHeight: 0,
        padding: '14px 40px 14px 16px',
        lineHeight: 'normal',
        borderRadius: 12,
      },
      '&:focus': {
        backgroundColor: 'transparent',
      },
    },
    icon: {
      '&&': {
        right: 14,
        top: 'calc(50% - 7px)',
        width: 14,
        height: 14,
      },
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
      position: 'relative',
      minHeight: 0,
      padding: '3px 12px 3px 22px',
      borderRadius: 4,
      fontFamily: instrumentSansFontFamily,
      fontSize: 15,
      lineHeight: 1.35,
      letterSpacing: 'normal',
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto',
      '&.Mui-selected': {
        backgroundColor: 'transparent',
      },
      '&.Mui-selected::before': {
        content: '"✓"',
        position: 'absolute',
        left: 7,
      },
      '&:hover, &.Mui-selected:hover, &.Mui-focusVisible, &.Mui-selected.Mui-focusVisible':
        {
          backgroundColor: colors.oceanBlue,
          color: colors.white,
        },
    },
    searchButton: {
      marginTop: 4,
      minHeight: 52,
      border: 0,
      borderRadius: 12,
      background: colors.white,
      color: colors.navy,
      fontFamily: 'inherit',
      fontSize: 17,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      '&:hover': {
        background: colors.white,
      },
    },
    text: {
      margin: '24px 0 0',
      maxWidth: 520,
      fontFamily: 'inherit',
      fontSize: 19,
      lineHeight: 1.55,
      letterSpacing: 'normal',
      color: 'rgba(255,255,255,.92)',
      textShadow: '0 1px 12px rgba(0,0,0,.45)',
    },
  });

type HeroProps = WithStyles<typeof styles>;

export default withStyles(styles)(Hero);
