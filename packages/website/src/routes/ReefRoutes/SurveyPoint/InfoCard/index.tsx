import React from "react";
import {
  Box,
  Container,
  Card,
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Theme,
} from "@material-ui/core";

import Info from "./Info";
import Map from "./Map";
import { Reef } from "../../../../store/Reefs/types";

const InfoCard = ({ reef, pointId, classes }: InfoCardProps) => {
  return (
    <Box bgcolor="rgb(245, 246, 246)">
      <Container>
        <Grid className={classes.cardWrapper} container justify="center">
          <Grid item xs={12} sm={12}>
            <Card elevation={3}>
              <Grid container justify="space-between">
                <Info reef={reef} pointId={pointId} />
                <Map reef={reef} selectedPointId={pointId} />
              </Grid>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    cardWrapper: {
      marginBottom: 100,
      [theme.breakpoints.down("xs")]: {
        marginBottom: 50,
      },
    },
  });

interface InfoCardIncomingProps {
  reef: Reef;
  pointId: number;
}

type InfoCardProps = InfoCardIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(InfoCard);
