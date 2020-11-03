import React from "react";
import { Grid, Typography, Box, Button, useTheme } from "@material-ui/core";
import { Link } from "react-router-dom";

import NavBar from "../NavBar";
import Footer from "../Footer";

const ErrorPage = () => {
  const theme = useTheme();

  return (
    <>
      <NavBar searchLocation={false} />
      <Box
        color={theme.palette.primary.main}
        height="100%"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
        >
          <Box mb="1rem" p="1rem">
            <Typography variant="h2">Sorry, something went wrong...</Typography>
          </Box>
          <Grid container direction="row" justify="center">
            <Button
              style={{ margin: "1rem" }}
              color="primary"
              variant="contained"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
            <Button
              style={{ margin: "1rem", color: "white" }}
              component={Link}
              to="/map"
              color="primary"
              variant="contained"
            >
              Back to Map
            </Button>
          </Grid>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default ErrorPage;
