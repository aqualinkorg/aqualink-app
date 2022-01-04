import React from "react";
import { Container, makeStyles, Theme } from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";

import NavBar from "../../../common/NavBar";
import { useSiteRequest } from "../../../hooks/useSiteRequest";
import Header from "./Header";

const UploadData = ({ match }: MatchProps) => {
  const classes = useStyles();
  const { site, siteLoading } = useSiteRequest(match.params.id);
  const loading = !site || siteLoading;

  return (
    <>
      <NavBar searchLocation={false} loading={loading} />
      {site && (
        <Container className={classes.root}>
          <Header site={site} />
        </Container>
      )}
    </>
  );
};

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
  },
}));

interface MatchProps extends RouteComponentProps<{ id: string }> {}

export default UploadData;
