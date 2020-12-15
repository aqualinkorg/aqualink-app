import React from "react";
import {
  withStyles,
  WithStyles,
  createStyles,
  Container,
  Grid,
  Typography,
  Box,
  Button,
  Theme,
} from "@material-ui/core";
import { Link } from "react-router-dom";

import NavBar from "../../common/NavBar";
import Footer from "../../common/Footer";
import Card from "./Card";
import landingPageImage from "../../assets/img/landing-page/header.jpg";
import { cardTitles } from "./titles";

const LandingPage = ({ classes }: LandingPageProps) => {
  return (
    <>
      <NavBar routeButtons searchLocation={false} />
      <div>
        <Box
          display="flex"
          alignItems="center"
          className={classes.landingImage}
        >
          <Container className={classes.container}>
            <Grid container item xs={9}>
              <Box display="flex">
                <Typography variant="h1" color="textPrimary">
                  Aqua
                </Typography>
                <Typography
                  className={classes.aqualinkSecondPart}
                  color="textPrimary"
                  variant="h1"
                >
                  link
                </Typography>
              </Box>
            </Grid>
            <Grid container item sm={11} md={7}>
              <Box mt="1.5rem" display="flex">
                <Typography variant="h1" color="textPrimary">
                  Temperature monitoring for marine ecosystems
                </Typography>
              </Box>
            </Grid>
            <Grid container item sm={9} md={4}>
              <Box mt="4rem" display="flex">
                <Typography variant="h4" color="textPrimary">
                  A tool for people on the front lines of ocean conservation
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box mt="2rem">
                <Grid container spacing={3}>
                  <Grid item>
                    <Button
                      component={Link}
                      to="/map"
                      className={classes.buttons}
                      variant="contained"
                      color="primary"
                    >
                      <Typography variant="h5">View The Map</Typography>
                    </Button>
                  </Grid>
                  <Grid item>
                    <Button
                      component={Link}
                      to="/register"
                      className={`${classes.buttons} ${classes.registerButton}`}
                      variant="outlined"
                      color="primary"
                    >
                      <Typography variant="h5">Register Your Site</Typography>
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Grid>
          </Container>
        </Box>
      </div>
      <Container>
        {cardTitles.map((item) => (
          <Card
            key={item.title}
            title={item.title}
            text={item.text}
            backgroundColor={item.backgroundColor}
            direction={item.direction}
            image={item.image}
            scaleDown={item.scaleDown}
          />
        ))}
      </Container>
      <Footer />
    </>
  );
};

const styles = (theme: Theme) =>
  createStyles({
    landingImage: {
      backgroundImage: `url("${landingPageImage}")`,
      backgroundSize: "cover",
      left: 160,
      height: 864,
      [theme.breakpoints.down("xs")]: {
        height: 576,
      },
    },
    container: {
      [theme.breakpoints.up("sm")]: {
        paddingLeft: "12vw",
        paddingRight: 40,
      },
    },
    aqualinkSecondPart: {
      opacity: 0.5,
    },
    buttons: {
      height: 48,
      width: 208,
      textTransform: "none",
      "&:hover": {
        color: "#ffffff",
      },
    },
    registerButton: {
      color: "#ffffff",
      border: "2px solid #ffffff",
      "&:hover": {
        color: "#ffffff",
        border: "2px solid #ffffff",
      },
    },
  });

type LandingPageProps = WithStyles<typeof styles>;

export default withStyles(styles)(LandingPage);
