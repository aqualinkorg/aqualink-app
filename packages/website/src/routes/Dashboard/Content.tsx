import React from "react";
import { Container, Grid, Box, Typography, useTheme } from "@material-ui/core";
import { User } from "../../store/User/types";
import BackButton from "./BackButton";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";

const Content = ({ user }: ContentProps) => {
  const { collection } = user;
  const theme = useTheme();

  if (!collection || collection.reefs.length === 0) {
    return (
      <Box
        height="100%"
        textAlign="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color={theme.palette.primary.main}
      >
        <Typography variant="h2">No sites added to your collection</Typography>
      </Box>
    );
  }

  return (
    <Container>
      <BackButton collectionName={collection.name} />
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12} sm={11} md={6}>
          <Map collection={collection} />
        </Grid>
        <Grid item xs={12} sm={11} md={6}>
          <Info user={user} collection={collection} />
        </Grid>
      </Grid>
      <Table collection={collection} />
    </Container>
  );
};

interface ContentIncomingProps {
  user: User;
}

type ContentProps = ContentIncomingProps;

export default Content;
