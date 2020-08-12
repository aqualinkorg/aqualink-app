import React, { useState, ReactNode } from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
} from "@material-ui/core";
import SwipeableViews from "react-swipeable-views";

import type { Reef } from "../../../store/Reefs/types";
import Map from "./Map";
import Form from "./Form";
import SurveyHistory from "../../ReefRoutes/Reef/Surveys";
import UploadMedia from "./UploadMedia";

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div hidden={value !== index} {...other}>
      {value === index && <div>{children}</div>}
    </div>
  );
};

const NewSurvey = ({ reef, classes }: NewSurveyProps) => {
  const [value, setValue] = useState<number>(0);

  const onPanelIndexChange = (index: number) => {
    setValue(index);
  };

  return (
    <SwipeableViews index={value} axis="x">
      <TabPanel value={value} index={0}>
        <Grid className={classes.root} container justify="center">
          <Grid item xs={10}>
            {reef.name && (
              <Typography variant="h5">{`NEW SURVEY FOR ${reef.name.toUpperCase()}`}</Typography>
            )}
          </Grid>
          <Grid
            style={{ marginTop: "2rem" }}
            container
            justify="space-between"
            item
            xs={10}
          >
            <Grid item xs={12}>
              <Typography
                style={{ fontWeight: "normal", marginBottom: "0.5rem" }}
                variant="h6"
              >
                Choose survey location from map
              </Typography>
            </Grid>
            <Grid className={classes.mapContainer} item xs={6}>
              <Map polygon={reef.polygon} />
            </Grid>
            <Grid item xs={5}>
              <Form changeTab={onPanelIndexChange} />
            </Grid>
          </Grid>
          <Grid item xs={12}>
            <SurveyHistory addNew={false} reefId={reef.id} />
          </Grid>
        </Grid>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <UploadMedia changeTab={onPanelIndexChange} />
      </TabPanel>
    </SwipeableViews>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "2rem",
    },
    mapContainer: {
      height: "30rem",
    },
  });

interface NewSurveyIncomingProps {
  reef: Reef;
}

interface TabPanelProps {
  children: ReactNode;
  index: any;
  value: any;
}

type NewSurveyProps = NewSurveyIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(NewSurvey);
