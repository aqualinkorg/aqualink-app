import React from "react";
import { Typography, Box, Button, useTheme } from "@material-ui/core";

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
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box mb="1rem">
            <Typography variant="h1">Something went wrong</Typography>
          </Box>
          <Button
            color="primary"
            variant="contained"
            onClick={() => window.location.reload()}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      <Footer />
    </>
  );
};

export default ErrorPage;
