import React, { useEffect, useState } from "react";
import { Container, Grid, LinearProgress } from "@material-ui/core";
import { CollectionDetails, User } from "../../store/User/types";
import BackButton from "./BackButton";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";
import userServices from "../../services/userServices";
import Message from "../../common/Message";

const FEATURED_COLLECTION_ID = "1";

const Content = ({ staticMode, signedInUser }: ContentProps) => {
  const { collection: signedInUserCollection } = signedInUser || {};
  const [staticCollection, setStaticCollection] = useState<CollectionDetails>();
  const [staticCollectionLoading, setStaticCollectionLoading] = useState(false);
  const [staticCollectionErrored, setStaticCollectionErrored] = useState(false);

  const collection = staticMode ? staticCollection : signedInUserCollection;

  useEffect(() => {
    if (staticMode) {
      setStaticCollectionLoading(true);
      userServices
        .getPublicCollection(FEATURED_COLLECTION_ID)
        .then(({ data }) => setStaticCollection(data))
        .catch(() => setStaticCollectionErrored(true))
        .finally(() => setStaticCollectionLoading(false));
    }
  }, [staticMode]);

  if (staticCollectionLoading) {
    return <LinearProgress />;
  }

  if (staticMode && staticCollectionErrored) {
    return <Message message="Collection not found" />;
  }

  if (!collection || collection.reefs.length === 0) {
    return <Message message="No sites added to your collection" />;
  }

  return (
    <Container>
      <BackButton collectionName={collection.name} />
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
  signedInUser: User | null;
  staticMode?: boolean;
}

Content.defaultProps = {
  staticMode: false,
};

export default Content;
