import React, { useState } from "react";
import { Container, makeStyles, Theme } from "@material-ui/core";
import { AlertProps } from "@material-ui/lab";
import { RouteComponentProps } from "react-router-dom";
import { DropzoneProps } from "react-dropzone";
import { uniqBy } from "lodash";
import { useSelector } from "react-redux";

import NavBar from "../../../common/NavBar";
import Header from "./Header";
import Selectors from "./Selectors";
import DropZone from "./DropZone";
import FileList from "./FileList";
import { useSiteRequest } from "../../../hooks/useSiteRequest";
import { Sources } from "../../../store/Sites/types";
import uploadServices from "../../../services/uploadServices";
import { userInfoSelector } from "../../../store/User/userSlice";
import UploadButton from "./UploadButton";
import StatusSnackbar from "./StatusSnackbar";

const UploadData = ({ match }: MatchProps) => {
  const classes = useStyles();
  const { token } = useSelector(userInfoSelector) || {};
  const { site, siteLoading } = useSiteRequest(match.params.id);
  const [isSelectionCompleted, setIsSelectionCompleted] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sources>();
  const [selectedPoint, setSelectedPoint] = useState<number>();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<AlertProps["severity"]>();
  const loading = !site || siteLoading;

  const onCompletedSelection = () => setIsSelectionCompleted(true);

  const onFileDelete = (name: string) =>
    setFiles(files.filter((file) => file.name !== name));

  const onFilesDrop: DropzoneProps["onDropAccepted"] = (
    acceptedFiles: File[]
  ) => setFiles(uniqBy([...files, ...acceptedFiles], "name"));

  const onStatusSnackbarClose = () => setUploadStatus(undefined);

  const onUpload = async () => {
    setUploadLoading(true);
    setUploadStatus(undefined);
    try {
      if (
        typeof site?.id === "number" &&
        typeof selectedPoint === "number" &&
        selectedSensor
      ) {
        const data = new FormData();
        files.forEach((file) => data.append("files", file));
        data.append("sensor", selectedSensor);
        await uploadServices.uploadTimeSeriesData(
          data,
          site.id,
          selectedPoint,
          token
        );
        setFiles([]);
        setUploadStatus("success");
      }
    } catch (err) {
      setUploadStatus("error");
    } finally {
      setUploadLoading(false);
    }
  };

  return (
    <>
      <NavBar searchLocation={false} loading={loading} />
      {uploadStatus && (
        <StatusSnackbar
          handleClose={onStatusSnackbarClose}
          severity={uploadStatus}
        />
      )}

      {site && (
        <Container className={classes.root}>
          <Header site={site} />
          <Selectors
            site={site}
            onCompletedSelection={onCompletedSelection}
            onSensorChange={setSelectedSensor}
            onPointChange={setSelectedPoint}
          />
          {isSelectionCompleted && <DropZone onFilesDrop={onFilesDrop} />}
          {files.length > 0 && (
            <>
              <FileList
                files={files}
                loading={uploadLoading}
                onFileDelete={onFileDelete}
              />
              <UploadButton loading={uploadLoading} onUpload={onUpload} />
            </>
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
