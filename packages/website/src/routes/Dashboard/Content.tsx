import React, { useEffect, useState } from "react";
import { Container, Grid, LinearProgress } from "@material-ui/core";
import { useSelector } from "react-redux";

import { CollectionDetails } from "../../store/User/types";
import Header from "./Header";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";
import userServices from "../../services/userServices";
import FullScreenMessage from "../../common/FullScreenMessage";
import { userInfoSelector } from "../../store/User/userSlice";

const collections: { [key: string]: string } = {
  minderoo: "1",
};

const DashboardContentComponent = (collection: CollectionDetails) => (
  <Container>
    <Header collectionName={collection.name} />
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
);

const Content = ({ defaultCollectionName }: ContentProps) => {
  const signedInUser = useSelector(userInfoSelector);
  const { collection: signedInUserCollection } = signedInUser || {};
  const [defaultCollection, setDefaultCollection] = useState<
    CollectionDetails
  >();
  const [defaultCollectionLoading, setDefaultCollectionLoading] = useState(
    false
  );
  const [defaultCollectionErrored, setDefaultCollectionErrored] = useState(
    false
  );

  const defaultCollectionId = defaultCollectionName
    ? collections[defaultCollectionName]
    : undefined;

  useEffect(() => {
    if (defaultCollectionId) {
      setDefaultCollectionLoading(true);
      userServices
        .getPublicCollection(defaultCollectionId)
        .then(({ data }) => setDefaultCollection(data))
        .catch(() => setDefaultCollectionErrored(true))
        .finally(() => setDefaultCollectionLoading(false));
    }
  }, [defaultCollectionId]);

  switch (true) {
    case !!defaultCollectionId:
      if (defaultCollectionLoading) {
        return <LinearProgress />;
      }
      if (defaultCollectionErrored) {
        return <FullScreenMessage message="Collection not found" />;
      }
      if (defaultCollection?.reefs.length) {
        return DashboardContentComponent(defaultCollection);
      }
      return <FullScreenMessage message="No sites added to this collection" />;
    case !!signedInUserCollection:
      if (signedInUserCollection?.reefs.length) {
        return DashboardContentComponent(signedInUserCollection);
      }
      return <FullScreenMessage message="No sites added to your collection" />;
    default:
      return null;
  }
};

interface ContentProps {
  defaultCollectionName?: string;
}

Content.defaultProps = {
  defaultCollectionName: undefined,
};

export default Content;
