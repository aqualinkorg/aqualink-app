import React from "react";
import { Container, Grid, LinearProgress } from "@material-ui/core";
import { useSelector } from "react-redux";
import Header from "./Header";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";
import FullScreenMessage from "../../common/FullScreenMessage";
import {
  collectionDetailsSelector,
  collectionErrorSelector,
  collectionLoadingSelector,
} from "../../store/Collection/collectionSlice";
import Tracker from "../Tracker";

const Content = () => {
  const collection = useSelector(collectionDetailsSelector);
  const collectionLoading = useSelector(collectionLoadingSelector);
  const collectionErrored = useSelector(collectionErrorSelector);

  if (collectionLoading) {
    return <LinearProgress />;
  }

  if (collectionErrored) {
    return <FullScreenMessage message="Collection not found" />;
  }

  if (collection?.sites.length === 0) {
    return <Tracker shouldShowNav={false} />;
  }

  return collection ? (
    <Container>
      <Header collection={collection} />
      <Grid container justify="center" spacing={2}>
        <Grid item xs={12} sm={11} md={6}>
          <Map collection={collection} />
        </Grid>
        <Grid item xs={12} sm={11} md={6}>
          <Info collection={collection} />
        </Grid>
      </Grid>
      <Table collection={collection} />
    </Container>
  ) : (
    <Tracker shouldShowNav={false} />
  );
};

export default Content;
