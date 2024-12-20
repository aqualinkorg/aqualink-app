import React, { useState, ReactNode, useEffect } from 'react';
import { Grid, Typography, Container, Box, Theme } from '@mui/material';
import { WithStyles } from '@mui/styles';
import withStyles from '@mui/styles/withStyles';
import createStyles from '@mui/styles/createStyles';
import SwipeableViews from 'react-swipeable-views';

import type { Site } from 'store/Sites/types';
import Map from './Map';
import Form from './Form';
import UploadMedia from './UploadMedia';

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div style={{ overflow: 'hidden' }}>
      <Container hidden={value !== index} {...other}>
        {value === index && <div>{children}</div>}
      </Container>
    </div>
  );
};

const NewSurvey = ({ site, classes }: NewSurveyProps) => {
  const [value, setValue] = useState<number>(0);

  const onPanelIndexChange = (index: number) => {
    setValue(index);
  };

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <Box flexGrow={1}>
      <SwipeableViews index={value} axis="x">
        <TabPanel value={value} index={0}>
          <Grid className={classes.root} container justifyContent="center">
            <Grid item xs={10}>
              {site.name && (
                <Typography
                  className={classes.title}
                  variant="h5"
                >{`NEW SURVEY FOR ${site.name.toUpperCase()}`}</Typography>
              )}
            </Grid>
            <Grid
              style={{ marginTop: '2rem' }}
              container
              justifyContent="space-between"
              item
              xs={10}
            >
              <Grid item xs={12}>
                <Typography
                  style={{ fontWeight: 'normal', marginBottom: '0.5rem' }}
                  variant="h6"
                >
                  Select your survey location by clicking on the map.
                </Typography>
              </Grid>
              <Grid className={classes.mapContainer} item xs={12} lg={6}>
                <Map polygon={site.polygon} />
              </Grid>
              <Grid item xs={12} lg={5}>
                <Form
                  siteId={site.id}
                  timeZone={site.timezone}
                  changeTab={onPanelIndexChange}
                />
              </Grid>
            </Grid>
          </Grid>
        </TabPanel>
        <TabPanel value={value} index={1}>
          <UploadMedia
            siteName={site.name}
            siteId={site.id}
            changeTab={onPanelIndexChange}
          />
        </TabPanel>
      </SwipeableViews>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    root: {
      marginTop: '2rem',
    },
    title: {
      overflowWrap: 'break-word',
    },
    mapContainer: {
      height: '30rem',
      [theme.breakpoints.down('xl')]: {
        marginBottom: '3rem',
      },
      [theme.breakpoints.down('sm')]: {
        height: '15rem',
      },
    },
  });

interface NewSurveyIncomingProps {
  site: Site;
}

interface TabPanelProps {
  children: ReactNode;
  index: any;
  value: any;
}

type NewSurveyProps = NewSurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(NewSurvey);
