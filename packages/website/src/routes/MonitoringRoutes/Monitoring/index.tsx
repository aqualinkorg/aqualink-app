import { Card, CardContent, Typography } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { colors } from 'layout/App/theme';
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { compereAdminLevel } from 'store/User/helpers';
import { AdminLevel } from 'store/User/types';
import { userInfoSelector } from 'store/User/userSlice';

interface Tile {
  title: string;
  link: string;
  description?: string | React.JSX.Element;
  adminLevel: AdminLevel;
}

const tiles: Tile[] = [
  {
    title: 'Sites Overview',
    link: '/monitoring/sites-overview',
    description: 'Contact info and status data for all sites',
    adminLevel: 'super_admin',
  },
  {
    title: 'Sites Status',
    link: '/monitoring/sites-status',
    description: 'Summary of status data accross all sites',
    adminLevel: 'super_admin',
  },
  {
    title: 'Site Usage Metrics',
    link: '/monitoring/site-metrics',
    description: 'Detailed usage metrics for one site',
    adminLevel: 'site_manager',
  },
  {
    title: 'Monthly Usage Report',
    link: '/monitoring/monthly-report',
    description: 'Detailed usage metrics for all sites over the past month',
    adminLevel: 'super_admin',
  },
  {
    title: 'Surveys',
    link: '/monitoring/surveys-report',
    description: 'List all recent surveys',
    adminLevel: 'super_admin',
  },
  {
    title: 'AI Prompts',
    link: '/monitoring/prompts',
    description: 'Edit AI Assistant prompts and behavior',
    adminLevel: 'super_admin',
  },
];

const useStyles = makeStyles(() => ({
  root: {
    width: '17rem',
    height: '7rem',
    boxShadow: '7rem',
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

function Monitoring() {
  const classes = useStyles();
  const user = useSelector(userInfoSelector);

  return (
    <div className={classes.wrapper}>
      {tiles
        .filter((x) => compereAdminLevel(user?.adminLevel, x.adminLevel) >= 0)
        .map((tile) => (
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

export default Monitoring;
