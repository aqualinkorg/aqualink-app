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
import { Pois, Reef } from "../../../../store/Reefs/types";
import { getReefNameAndRegion } from "../../../../store/Reefs/helpers";

const InfoCard = ({
  reef,
  points,
  pointName,
  nSurveys,
  classes,
}: InfoCardProps) => {
  const { name: reefName, region: reefRegion } = getReefNameAndRegion(reef);
  const [lng, lat] =
    reef.polygon.type === "Point" ? reef.polygon.coordinates : [];

  return (
    <Container>
      <Grid className={classes.cardWrapper} container justify="center">
        <Grid item xs={12} sm={10}>
          <Card elevation={3}>
            <Grid container justify="space-between">
              <Info
                lat={lat}
                lng={lng}
                nSurveys={nSurveys}
                pointName={pointName}
                reefName={reefName}
                reefRegion={reefRegion}
              />
              <Map reef={reef} points={points} />
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
  pointName: string;
  nSurveys: number;
  points: Pois[];
}

type InfoCardProps = InfoCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoCard);
