import React from "react";
import { Container, Grid } from "@material-ui/core";
import { User } from "../../store/User/types";
import { createCollection } from "./collection";
import BackButton from "./BackButton";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";
import { Reef } from "../../store/Reefs/types";

const Content = ({ user, reefsList }: ContentProps) => {
  const collection = createCollection(reefsList, 8);
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
  reefsList: Reef[];
}

type ContentProps = ContentIncomingProps;

export default Content;
