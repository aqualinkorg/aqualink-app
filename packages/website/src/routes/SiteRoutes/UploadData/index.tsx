import React, { useState } from "react";
import { Container, makeStyles, Theme } from "@material-ui/core";
import { RouteComponentProps } from "react-router-dom";
import { DropzoneProps } from "react-dropzone";
import { uniqBy } from "lodash";

import NavBar from "../../../common/NavBar";
import Header from "./Header";
import Selectors from "./Selectors";
import DropZone from "./DropZone";
import FileList from "./FileList";
import { useSiteRequest } from "../../../hooks/useSiteRequest";

const UploadData = ({ match }: MatchProps) => {
  const classes = useStyles();
  const { site, siteLoading } = useSiteRequest(match.params.id);
  const [isSelectionCompleted, setIsSelectionCompleted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const loading = !site || siteLoading;

  const onCompletedSelection = () => setIsSelectionCompleted(true);

  const onFileDelete = (name: string) =>
    setFiles(files.filter((file) => file.name !== name));

  const onFilesDrop: DropzoneProps["onDropAccepted"] = (
    acceptedFiles: File[]
  ) => setFiles(uniqBy([...files, ...acceptedFiles], "name"));

  return (
    <>
      <NavBar searchLocation={false} loading={loading} />
      {site && (
        <Container className={classes.root}>
          <Header site={site} />
          <Selectors site={site} onCompletedSelection={onCompletedSelection} />
          {isSelectionCompleted && <DropZone onFilesDrop={onFilesDrop} />}
          {files.length > 0 && (
            <FileList files={files} onFileDelete={onFileDelete} />
          )}
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
