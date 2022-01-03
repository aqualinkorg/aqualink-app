import { LinearProgress } from "@material-ui/core";
import React from "react";
import { RouteComponentProps } from "react-router-dom";

import NavBar from "../../../common/NavBar";
import { useSiteRequest } from "../../../hooks/useSiteRequest";

const UploadData = ({ match }: MatchProps) => {
  const { siteLoading } = useSiteRequest(match.params.id);

  return (
    <>
      <NavBar searchLocation={false} />
      {siteLoading && <LinearProgress />}
    </>
  );
};

interface MatchProps extends RouteComponentProps<{ id: string }> {}

export default UploadData;
