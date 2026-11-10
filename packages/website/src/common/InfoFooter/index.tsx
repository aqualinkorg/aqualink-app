import React from 'react';
import { Box, Link as MuiLink, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import { colors, instrumentSansFontFamily } from 'layout/App/theme';

const footerLinks = [
  { label: 'About', to: '/about' },
  { label: 'FAQ', to: '/faq' },
  { label: 'Heatwave tracker', to: '/tracker' },
  {
    label: 'Contact us',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLSfrxrgFxmlplxh4JvV8eVj1smpgwZzQV0DHIjY2ujZmHNRUEA/viewform',
  },
];

function InfoFooter({ showProjectsLink = false, classes }: InfoFooterProps) {
  return (
    <Box component="footer" className={classes.footer}>
      <Box className={classes.inner}>
        <Box className={classes.content}>
          <Typography component="div" className={classes.logo}>
            Aqua<span className={classes.logoAccent}>link</span>
          </Typography>
          <Typography className={classes.text}>
            Aqualink is a philanthropic engineering organization dedicated to
            ocean monitoring and conservation. We build tools that give
            scientists, local communities and the public a clear view of marine
            health, so they can understand and protect our oceans.
            {showProjectsLink && (
              <>
                {' '}
                <MuiLink
                  component={Link}
                  to="/projects"
                  underline="none"
                  className={classes.projectsLink}
                >
                  Click here to find out more about the things we&apos;re doing
                  →
                </MuiLink>
              </>
            )}
          </Typography>
          <Box component="nav" aria-label="Footer" className={classes.links}>
            {footerLinks.map(({ label, to, href }) =>
              to ? (
                <MuiLink
                  key={label}
                  component={Link}
                  to={to}
                  underline="none"
                  className={classes.link}
                >
                  {label}
                </MuiLink>
              ) : (
                <MuiLink
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  underline="none"
                  className={classes.link}
                >
                  {label}
                </MuiLink>
              ),
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const styles = () =>
  createStyles({
    footer: {
      fontFamily: instrumentSansFontFamily,
      color: colors.navy,
      lineHeight: 'normal',
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto',
      background: colors.mistGray,
      borderTop: `1px solid ${colors.borderGray}`,
    },
    inner: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '56px 24px 40px',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 48,
      justifyContent: 'space-between',
    },
    content: {
      flex: '1 1 100%',
      minWidth: 0,
    },
    logo: {
      fontFamily: 'inherit',
      fontSize: 22,
      fontWeight: 700,
      lineHeight: 'normal',
      letterSpacing: '-0.02em',
    },
    logoAccent: {
      color: colors.oceanBlue,
    },
    text: {
      margin: '12px 0 0',
      fontFamily: 'inherit',
      fontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 'normal',
      color: colors.slateGray,
      maxWidth: 720,
    },
    links: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '8px 24px',
      marginTop: 24,
    },
    link: {
      fontFamily: 'inherit',
      fontSize: 15,
      fontWeight: 500,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.slateGray,
      '&:hover': {
        color: colors.oceanBlue,
      },
    },
    projectsLink: {
      fontFamily: 'inherit',
      fontWeight: 600,
      lineHeight: 'inherit',
      letterSpacing: 'normal',
      color: colors.oceanBlue,
      '&:hover': {
        color: colors.darkOceanBlue,
      },
    },
  });

interface InfoFooterIncomingProps {
  showProjectsLink?: boolean;
}

type InfoFooterProps = InfoFooterIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoFooter);
