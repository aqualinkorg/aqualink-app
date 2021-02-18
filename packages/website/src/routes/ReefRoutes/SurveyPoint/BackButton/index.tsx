import React from "react";
import {
  Button,
  Container,
  Grid,
  Typography,
  withStyles,
  WithStyles,
  createStyles,
} from "@material-ui/core";
import { ArrowBack } from "@material-ui/icons";
import { Link } from "react-router-dom";

const BackButton = ({ reefId, classes }: BackButtonProps) => {
  return (
    <Container>
      <Grid container className={classes.backButtonWrapper}>
        <Button
          color="primary"
          startIcon={<ArrowBack />}
          component={Link}
          to={`/reefs/${reefId}`}
        >
          <Typography className={classes.backButtonText}>
            Back to Site
          </Typography>
        </Button>
      </Grid>
    </Container>
  );
};

const styles = () =>
  createStyles({
    backButtonWrapper: {
      margin: "48px 0 16px 0",
    },

    backButtonText: {
      textTransform: "none",
    },
  });

interface BackButtonIncomingProps {
  reefId: string;
}

type BackButtonProps = BackButtonIncomingProps & WithStyles<typeof styles>;

export default withStyles(styles)(BackButton);
