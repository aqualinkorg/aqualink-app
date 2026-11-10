import React from 'react';
import {
  Box,
  CardMedia,
  Link as MuiLink,
  Theme,
  Typography,
} from '@mui/material';
import { Link } from 'react-router-dom';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import classNames from 'classnames';
import InfoNavBar from 'common/InfoNavBar';
import InfoFooter from 'common/InfoFooter';
import {
  colors,
  ibmPlexMonoFontFamily,
  instrumentSansFontFamily,
} from 'layout/App/theme';
import { projects, tableHeaders } from './titles';

function Projects({ classes }: ProjectsProps) {
  return (
    <Box className={classes.root}>
      <InfoNavBar currentPage="/projects" />

      <Box component="section" id="top" className={classes.projects}>
        <Typography className={classes.eyebrow}>Projects</Typography>
        <Typography variant="h1" className={classes.title}>
          What we build
        </Typography>
        <Typography className={classes.intro}>
          Software, hardware and storytelling from Aqualink, all made to help
          people watch over and protect the ocean.
        </Typography>
        <Box role="table" aria-label="Projects" className={classes.table}>
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
          {projects.map(
            ({
              title,
              tag,
              description,
              image,
              imageAlt,
              imageStyle,
              links,
            }) => (
              <Box key={title} role="row" className={classes.row}>
                <Box role="cell">
                  <CardMedia
                    component="img"
                    src={image}
                    alt={imageAlt}
                    className={classNames(classes.image, {
                      [classes.imageContain]: imageStyle === 'contain',
                      [classes.imagePoster]: imageStyle === 'poster',
                    })}
                  />
                </Box>
                <Box role="cell">
                  <Typography component="div" className={classes.projectTitle}>
                    {title}
                  </Typography>
                  <Typography component="div" className={classes.projectTag}>
                    {tag}
                  </Typography>
                </Box>
                <Typography role="cell" className={classes.description}>
                  {description}
                </Typography>
                <Box role="cell" className={classes.links}>
                  {links.map(({ label, to, href }) =>
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
            ),
          )}
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
    projects: {
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
      gridTemplateColumns: '320px 1fr 1.6fr 180px',
      gap: 32,
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
      gridTemplateColumns: '320px 1fr 1.6fr 180px',
      gap: 32,
      alignItems: 'start',
      padding: '28px 8px',
      borderBottom: `1px solid ${colors.borderGray}`,
      [theme.breakpoints.down('md')]: {
        gridTemplateColumns: '1fr',
        gap: 14,
      },
    },
    image: {
      display: 'block',
      width: '100%',
      aspectRatio: '4 / 3',
      objectFit: 'cover',
      borderRadius: 8,
      border: `1px solid ${colors.borderGray}`,
      background: colors.mistGray,
      boxSizing: 'content-box',
    },
    imageContain: {
      objectFit: 'contain',
      background: colors.white,
      padding: 16,
      boxSizing: 'border-box',
    },
    imagePoster: {
      objectPosition: '50% 30%',
      background: colors.navy,
    },
    projectTitle: {
      fontFamily: 'inherit',
      fontSize: 22,
      fontWeight: 600,
      lineHeight: 1.25,
      letterSpacing: 'normal',
    },
    projectTag: {
      marginTop: 8,
      fontFamily: ibmPlexMonoFontFamily,
      fontSize: 12,
      lineHeight: 'normal',
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      color: colors.oceanBlue,
    },
    description: {
      margin: 0,
      fontFamily: 'inherit',
      fontSize: 16,
      lineHeight: 1.6,
      letterSpacing: 'normal',
      color: colors.slateGray,
    },
    links: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
    link: {
      display: 'inline-block',
      padding: '6px 0',
      fontFamily: 'inherit',
      fontSize: 16,
      fontWeight: 600,
      lineHeight: 'normal',
      letterSpacing: 'normal',
      color: colors.oceanBlue,
      '&:hover': {
        color: colors.darkOceanBlue,
      },
    },
  });

type ProjectsProps = WithStyles<typeof styles>;

export default withStyles(styles)(Projects);
