import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Grid,
  Typography,
  Container,
} from "@material-ui/core";
import { useSelector } from "react-redux";
import { Redirect } from "react-router-dom";

import NavBar from "../../common/NavBar";
import { userInfoSelector } from "../../store/User/userSlice";
import { reefDetailsSelector } from "../../store/Reefs/selectedReefSlice";

const Apply = ({ classes }: ApplyProps) => {
  const reef = useSelector(reefDetailsSelector);
  const user = useSelector(userInfoSelector);
  return (
    <>
      {(!reef || !user) && <Redirect to="/" />}
      <NavBar searchLocation={false} />
      <Container className={classes.root}>
        <Grid container>
          <Grid item xs={12} md={7}>
            <Typography variant="h3" gutterBottom>
              Apply for a spotter
            </Typography>
            <Typography>
              Please take a moment to fill out this form for each site you would
              like to manage with an Aqualink spotter. If you have any
              questions, don&apos;t hesitate to reach out to
              <a className={classes.mail} href="mailto: info@aqualink.org">
                info@aqualink.org
              </a>
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const styles = () =>
  createStyles({
    root: {
      marginTop: "3rem",
    },
    mail: {
      marginLeft: "0.2rem",
    },
  });

type ApplyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Apply);
