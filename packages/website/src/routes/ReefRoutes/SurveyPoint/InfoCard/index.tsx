import React from "react";
import {
  Container,
  Card,
  withStyles,
  WithStyles,
  createStyles,
  Grid,
} from "@material-ui/core";

import Info from "./Info";
import Map from "./Map";
import { Reef } from "../../../../store/Reefs/types";

const InfoCard = ({ reef, pointId, classes }: InfoCardProps) => {
  return (
    <Container>
      <Grid className={classes.cardWrapper} container justify="center">
        <Grid item xs={12} sm={12}>
          <Card elevation={3}>
            <Grid container justify="space-between">
              <Info reef={reef} pointId={pointId} />
              <Map reef={reef} />
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

const styles = () =>
  createStyles({
    cardWrapper: {
      marginBottom: 100,
    },
  });

interface InfoCardIncomingProps {
  reef: Reef;
  pointId: number;
}

type InfoCardProps = InfoCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoCard);
