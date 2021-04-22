import React, { useEffect, useState } from "react";
import { Container, Grid, LinearProgress } from "@material-ui/core";
import { useSelector } from "react-redux";

import { CollectionDetails } from "../../store/User/types";
import Header from "./Header";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";
import userServices from "../../services/userServices";
import Message from "../../common/Message";
import { userInfoSelector } from "../../store/User/userSlice";

const collections: { [key: string]: string } = {
  minderoo: "1",
};

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

  const collection = defaultCollectionId
    ? defaultCollection
    : signedInUserCollection;

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

  if (defaultCollectionLoading) {
    return <LinearProgress />;
  }

  if (!collection && !defaultCollectionId) {
    return null;
  }

  if (defaultCollectionId && defaultCollectionErrored) {
    return <Message message="Collection not found" />;
  }

  if (!collection || collection.reefs.length === 0) {
    return <Message message="No sites added to this collection" />;
  }

  return (
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
};

interface ContentProps {
  defaultCollectionName?: string;
}

Content.defaultProps = {
  defaultCollectionName: undefined,
};

export default Content;
