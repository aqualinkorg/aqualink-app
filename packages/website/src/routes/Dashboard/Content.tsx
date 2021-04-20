import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  useTheme,
  LinearProgress,
} from "@material-ui/core";
import { CollectionDetails, User } from "../../store/User/types";
import BackButton from "./BackButton";
import Map from "./Map";
import Info from "./Info";
import Table from "./Table";
import userServices from "../../services/userServices";

const FEATURED_COLLECTION_ID = "1";

const Content = ({ staticMode, user }: ContentProps) => {
  const { collection: userCollection } = user || {};
  const [staticCollection, setStaticCollection] = useState<CollectionDetails>();
  const [staticCollectionLoading, setStaticCollectionLoading] = useState(false);
  const [staticCollectionErrored, setStaticCollectionErrored] = useState(false);
  const theme = useTheme();

  const collection = staticMode ? staticCollection : userCollection;

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
    return (
      <Box
        height="100%"
        textAlign="center"
        display="flex"
        alignItems="center"
        justifyContent="center"
        color={theme.palette.primary.main}
      >
        <Typography variant="h2">Collection not found</Typography>
      </Box>
    );
  }

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
          <Info user={collection.user} collection={collection} />
        </Grid>
      </Grid>
      <Table collection={collection} />
    </Container>
  );
};

interface ContentIncomingProps {
  user: User | null;
  staticMode?: boolean;
}

Content.defaultProps = {
  staticMode: false,
};

type ContentProps = ContentIncomingProps;

export default Content;
