import React from 'react';
import { Box, Button, Link as MuiLink, Theme, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import InfoNavBar from 'common/InfoNavBar';
import InfoFooter from 'common/InfoFooter';
import infoPageStyles from 'common/styles/infoPageStyles';
import { colors, ibmPlexMonoFontFamily } from 'layout/App/theme';
import { contactFormUrl } from 'constants/links';
import { exampleSites, tableHeaders } from './titles';

function ExampleLink({ to, href, className, children }: ExampleLinkProps) {
  return to ? (
    <MuiLink component={Link} to={to} underline="none" className={className}>
      {children}
    </MuiLink>
  ) : (
    <MuiLink
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      underline="none"
      className={className}
    >
      {children}
    </MuiLink>
  );
}

function Examples({ classes }: ExamplesProps) {
  return (
    <Box className={classes.root}>
      <InfoNavBar currentPage="/examples" />

      <Box component="section" id="more" className={classes.examples}>
        <Typography className={classes.eyebrow}>Examples</Typography>
        <Typography variant="h1" className={classes.title}>
          Site Examples
        </Typography>
        <Typography className={classes.intro}>
          We are highlighting sites that put the different capabilities of the
          platform to work. Open any dashboard to see the live data.
        </Typography>
        <Box className={classes.tableWrapper}>
          <Box
            role="table"
            aria-label="Features and example sites"
            className={classes.table}
          >
            <Box role="row" className={classes.headerRow}>
              {tableHeaders.map((header) => (
                <Typography
                  key={header}
                  component="div"
                  role="columnheader"
                  className={classes.columnHeader}
                >
                  {header}
                </Typography>
              ))}
            </Box>
            {exampleSites.map(
              ({
                feature,
                site,
                location,
                description,
                linkLabel,
                to,
                href,
              }) => (
                <Box key={site} role="row" className={classes.row}>
                  <Typography
                    component="div"
                    role="cell"
                    className={classes.featureCell}
                  >
                    <ExampleLink
                      to={to}
                      href={href}
                      className={classes.featureLink}
                    >
                      {feature}
                    </ExampleLink>
                  </Typography>
                  <Typography
                    component="div"
                    role="cell"
                    className={classes.siteCell}
                  >
                    {site}
                    <Typography component="div" className={classes.location}>
                      {location}
                    </Typography>
                  </Typography>
                  <Typography
                    component="div"
                    role="cell"
                    className={classes.descriptionCell}
                  >
                    {description}
                  </Typography>
                  <Box role="cell" className={classes.linkCell}>
                    <ExampleLink to={to} href={href} className={classes.link}>
                      {linkLabel}
                    </ExampleLink>
                  </Box>
                </Box>
              ),
            )}
          </Box>
        </Box>
      </Box>

      <Box component="section" id="register" className={classes.featured}>
        <Box className={classes.featuredInner}>
          <Box className={classes.featuredText}>
            <Typography variant="h2" className={classes.featuredTitle}>
              Using a feature in a new way?
            </Typography>
            <Typography className={classes.featuredIntro}>
              Tell us about your site. We feature reefs that show others what
              monitoring can do.
            </Typography>
          </Box>
          <Box className={classes.featuredButtons}>
            <Button
              component={Link}
              to="/register"
              className={classes.registerButton}
            >
              Register a site
            </Button>
            <Button
              href={contactFormUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={classes.contactButton}
            >
              Contact us
            </Button>
          </Box>
        </Box>
      </Box>

      <InfoFooter showProjectsLink />
    </Box>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    root: infoPageStyles.root,
    examples: {
      ...infoPageStyles.section,
      padding: '88px 24px 96px',
    },
    eyebrow: infoPageStyles.eyebrow,
    title: infoPageStyles.title,
    intro: {
      ...infoPageStyles.intro,
      margin: '14px 0 0',
      fontSize: 18,
    },
    tableWrapper: {
      marginTop: 36,
      overflowX: 'auto',
      border: `1px solid ${colors.borderGray}`,
      borderRadius: 14,
    },
    table: {
      minWidth: 900,
      [theme.breakpoints.down('md')]: {
        minWidth: 0,
      },
    },
    headerRow: {
      display: 'grid',
      gridTemplateColumns: '190px 230px minmax(0, 1fr) 200px',
      alignItems: 'start',
      background: colors.mistGray,
      [theme.breakpoints.down('md')]: {
        position: 'absolute',
        width: 1,
        height: 1,
        margin: -1,
        padding: 0,
        border: 0,
        overflow: 'hidden',
        clip: 'rect(0 0 0 0)',
      },
    },
    columnHeader: {
      padding: '14px 20px',
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 12,
      lineHeight: 'normal',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.slateGray,
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '190px 230px minmax(0, 1fr) 200px',
      alignItems: 'start',
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 8,
        padding: 20,
        borderTop: `1px solid ${colors.borderGray}`,
        '&:nth-of-type(2)': {
          borderTop: 'none',
        },
      },
    },
    featureCell: {
      padding: 20,
      borderTop: `1px solid ${colors.borderGray}`,
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 13,
      lineHeight: 'normal',
      letterSpacing: '0.04em',
      textTransform: 'uppercase',
      color: colors.oceanBlue,
      [theme.breakpoints.down('md')]: {
        padding: 0,
        borderTop: 'none',
      },
    },
    featureLink: {
      fontFamily: 'inherit',
      fontSize: 'inherit',
      lineHeight: 'inherit',
      letterSpacing: 'inherit',
      color: colors.oceanBlue,
      '&:hover': {
        color: colors.darkOceanBlue,
      },
    },
    siteCell: {
      padding: 20,
      borderTop: `1px solid ${colors.borderGray}`,
      fontFamily: 'inherit',
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      [theme.breakpoints.down('md')]: {
        padding: 0,
        borderTop: 'none',
      },
    },
    location: {
      marginTop: 4,
      fontFamily: 'inherit',
      fontSize: 14,
      fontWeight: 400,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.slateGray,
    },
    descriptionCell: {
      padding: 20,
      borderTop: `1px solid ${colors.borderGray}`,
      fontFamily: 'inherit',
      fontSize: 16,
      lineHeight: 1.55,
      letterSpacing: 'normal',
      color: colors.slateGray,
      [theme.breakpoints.down('md')]: {
        padding: 0,
        borderTop: 'none',
      },
    },
    linkCell: {
      padding: 20,
      borderTop: `1px solid ${colors.borderGray}`,
      [theme.breakpoints.down('md')]: {
        padding: 0,
        borderTop: 'none',
      },
    },
    link: {
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.oceanBlue,
      '&:hover': {
        color: colors.darkOceanBlue,
      },
    },
    featured: {
      background: colors.navy,
      color: colors.white,
    },
    featuredInner: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '72px 24px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 32,
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    featuredText: {
      flex: '1 1 520px',
      minWidth: 0,
    },
    featuredTitle: {
      margin: 0,
      fontFamily: 'inherit',
      fontSize: 36,
      lineHeight: 1.1,
      letterSpacing: '-0.02em',
      fontWeight: 700,
    },
    featuredIntro: {
      margin: '14px 0 0',
      fontFamily: 'inherit',
      fontSize: 18,
      lineHeight: 1.55,
      letterSpacing: 'normal',
      color: colors.paleGrayBlue,
      maxWidth: 600,
    },
    featuredButtons: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 12,
    },
    registerButton: {
      minWidth: 0,
      padding: '14px 24px',
      borderRadius: 8,
      fontFamily: 'inherit',
      fontSize: 17,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      background: colors.white,
      color: colors.navy,
      '&:hover': {
        background: colors.white,
        color: colors.navy,
      },
    },
    contactButton: {
      minWidth: 0,
      padding: '13px 22px',
      border: `1.5px solid ${colors.white}`,
      borderRadius: 8,
      fontFamily: 'inherit',
      fontSize: 17,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      textTransform: 'none',
      color: colors.white,
      '&:hover': {
        background: 'transparent',
        color: colors.white,
      },
    },
  });

interface ExampleLinkProps {
  to?: string;
  href?: string;
  className: string;
  children: React.ReactNode;
}

type ExamplesProps = WithStyles<typeof styles>;

export default withStyles(styles)(Examples);
