import { Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import { colors } from 'layout/App/theme';
import React from 'react';
import { Link } from 'react-router-dom';

interface Tile {
  title: string;
  link: string;
  description?: string | React.JSX.Element;
}

const tiles: Tile[] = [
  { title: 'Site Metrics', link: '/monitoring/site-metrics' },
  { title: 'Monthly Report', link: '/monitoring/monthly-report' },
  { title: 'Surveys Report', link: '/monitoring/surveys-report' },
  { title: 'Sites Overview', link: '/monitoring/sites-overview' },
  { title: 'Sites Status', link: '/monitoring/sites-status' },
];

function Monitoring() {
  const classes = useStyles();

  return (
    <div className={classes.wrapper}>
      {tiles.map((tile) => (
        <Link key={tile.link} to={tile.link} className={classes.link}>
          <Card className={classes.root} raised>
            <CardContent className={classes.cardContent}>
              <Typography
                variant="h5"
                color="textSecondary"
                className={classes.title}
              >
                {tile.title}
              </Typography>
              {tile.description && (
                <Typography
                  variant="body2"
                  component="p"
                  style={{ color: 'black', paddingBottom: '1rem' }}
                >
                  {tile.description}
                </Typography>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  );
}

const useStyles = makeStyles(() => ({
  root: {
    width: '17rem',
    height: '10rem',
    boxShadow: '10rem',
    '&:hover': {
      backgroundColor: colors.backgroundGray,
    },
  },
  title: {
    textDecoration: 'none',
  },
  link: {
    '&:hover': {
      textDecoration: 'none',
    },
  },
  wrapper: {
    display: 'flex',
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: '2rem',
    padding: '2rem',
  },
  cardContent: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    justifyContent: 'space-between',
  },
}));

export default Monitoring;
