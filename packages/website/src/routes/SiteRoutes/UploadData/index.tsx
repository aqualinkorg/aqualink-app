import React, { useState } from "react";
import { Container, makeStyles, Theme } from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";

import NavBar from "../../../common/NavBar";
import Header from "./Header";
import Selectors from "./Selectors";
import { useSiteRequest } from "../../../hooks/useSiteRequest";
import DropZone from "./DropZone";

const UploadData = ({ match }: MatchProps) => {
  const classes = useStyles();
  const { site, siteLoading } = useSiteRequest(match.params.id);
  const [isSelectionCompleted, setIsSelectionCompleted] = useState(false);
  const loading = !site || siteLoading;

  const onCompletedSelection = () => setIsSelectionCompleted(true);

  return (
    <>
      <NavBar searchLocation={false} loading={loading} />
      {site && (
        <Container className={classes.root}>
          <Header site={site} />
          <Selectors site={site} onCompletedSelection={onCompletedSelection} />
          {isSelectionCompleted && <DropZone />}
        </Container>
      )}
    </>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

interface MatchProps extends RouteComponentProps<{ id: string }> {}

export default UploadData;
