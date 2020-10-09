import React, { useCallback, useState } from "react";
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
import Obligations from "./Obligations";
import Agreements from "./Agreements";
import { userInfoSelector } from "../../store/User/userSlice";
import { reefDetailsSelector } from "../../store/Reefs/selectedReefSlice";
import { AgreementsChecked } from "./types";

const Apply = ({ classes }: ApplyProps) => {
  const reef = useSelector(reefDetailsSelector);
  const user = useSelector(userInfoSelector);
  const [agreementsChecked, setAgreementsChecked] = useState<AgreementsChecked>(
    {
      shipping: false,
      buoy: false,
      survey: false,
    }
  );

  const updateAgreement = useCallback(
    (label: keyof AgreementsChecked) => {
      setAgreementsChecked({
        ...agreementsChecked,
        [label]: !agreementsChecked[label],
      });
    },
    [agreementsChecked]
  );

  return (
    <>
      {(!reef || !user) && <Redirect to="/" />}
      <NavBar searchLocation={false} />
      <Container className={classes.welcomeMessage}>
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
      <Container>
        <Grid container justify="space-between">
          <Grid item xs={12} md={6}>
            <Obligations />
            <Agreements
              agreementsChecked={agreementsChecked}
              handleChange={updateAgreement}
            />
          </Grid>
          <Grid item xs={12} md={5}>
            Form
          </Grid>
        </Grid>
      </Container>
    </>
  );
};

const styles = () =>
  createStyles({
    welcomeMessage: {
      marginTop: "3rem",
      marginBottom: "5rem",
    },
    mail: {
      marginLeft: "0.2rem",
    },
  });

type ApplyProps = WithStyles<typeof styles>;

export default withStyles(styles)(Apply);
