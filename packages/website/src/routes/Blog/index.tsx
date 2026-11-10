import React from 'react';
import { Box, Link as MuiLink, Theme, Typography } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import InfoNavBar from 'common/InfoNavBar';
import InfoFooter from 'common/InfoFooter';
import {
  colors,
  ibmPlexMonoFontFamily,
  instrumentSansFontFamily,
} from 'layout/App/theme';
import { stories, tableHeaders } from './titles';

function Blog({ classes }: BlogProps) {
  return (
    <Box className={classes.root}>
      <InfoNavBar currentPage="/blog" />

      <Box component="section" id="top" className={classes.blog}>
        <Typography className={classes.eyebrow}>Blog</Typography>
        <Typography variant="h1" className={classes.title}>
          Stories from the field
        </Typography>
        <Typography className={classes.intro}>
          How scientists, restoration teams and local divers use Aqualink data
          on their reefs.
        </Typography>
        <Box role="table" aria-label="Stories" className={classes.table}>
          <Box role="row" className={classes.headerRow}>
            {tableHeaders.map((header) => (
              <Typography
                key={header}
                component="span"
                role="columnheader"
                className={classes.columnHeader}
              >
                {header}
              </Typography>
            ))}
          </Box>
          {stories.map(({ title, location, tag, summary, href }) => (
            <MuiLink
              key={title}
              role="row"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              underline="none"
              className={classes.row}
            >
              <Typography
                component="span"
                role="cell"
                className={classes.storyTitle}
              >
                {title}
              </Typography>
              <Typography
                component="span"
                role="cell"
                className={classes.location}
              >
                {location}
                <br />
                <span className={classes.tag}>{tag}</span>
              </Typography>
              <Typography
                component="span"
                role="cell"
                className={classes.summary}
              >
                {summary}
              </Typography>
              <Typography
                component="span"
                role="cell"
                className={classes.readMore}
              >
                Read story →
              </Typography>
            </MuiLink>
          ))}
        </Box>
      </Box>

      <InfoFooter />
    </Box>
  );
}

const styles = (theme: Theme) =>
  createStyles({
    root: {
      fontFamily: instrumentSansFontFamily,
      color: colors.navy,
      background: colors.white,
      lineHeight: 'normal',
      minWidth: 0,
      WebkitFontSmoothing: 'auto',
      MozOsxFontSmoothing: 'auto',
    },
    blog: {
      maxWidth: 1200,
      margin: '0 auto',
      boxSizing: 'content-box',
      padding: '88px 24px 112px',
    },
    eyebrow: {
      margin: '0 0 16px',
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 14,
      lineHeight: 'normal',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
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
    table: {
      marginTop: 56,
      borderTop: `1px solid ${colors.navy}`,
    },
    headerRow: {
      display: 'grid',
      gridTemplateColumns: '260px 220px 1fr 140px',
      gap: 24,
      padding: '14px 8px',
      borderBottom: `1px solid ${colors.borderGray}`,
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
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 13,
      lineHeight: 'normal',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.slateGray,
    },
    row: {
      display: 'grid',
      gridTemplateColumns: '260px 220px 1fr 140px',
      gap: 24,
      alignItems: 'baseline',
      padding: '22px 8px',
      borderBottom: `1px solid ${colors.borderGray}`,
      fontFamily: 'inherit',
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.navy,
      '&:hover': {
        color: colors.navy,
      },
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        gap: 6,
      },
    },
    storyTitle: {
      fontFamily: 'inherit',
      fontSize: 20,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
    },
    location: {
      fontFamily: 'inherit',
      fontSize: 16,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.slateGray,
    },
    tag: {
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 12,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.oceanBlue,
    },
    summary: {
      fontFamily: 'inherit',
      fontSize: 16,
      lineHeight: 1.5,
      letterSpacing: 'normal',
      color: colors.slateGray,
    },
    readMore: {
      fontFamily: 'inherit',
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.oceanBlue,
      textAlign: 'right',
      [theme.breakpoints.down('md')]: {
        textAlign: 'left',
      },
    },
  });

type BlogProps = WithStyles<typeof styles>;

export default withStyles(styles)(Blog);
