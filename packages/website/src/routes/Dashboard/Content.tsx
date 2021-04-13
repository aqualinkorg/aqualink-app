import React from "react";
import { Container, Grid } from "@material-ui/core";
import { User } from "../../store/User/types";
import { collection } from "./collection";
import BackButton from "./BackButton";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";

const Content = ({ user }: ContentProps) => {
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
      <Table />
    </Container>
  );
};

interface ContentIncomingProps {
  user: User;
}

type ContentProps = ContentIncomingProps;

export default Content;
