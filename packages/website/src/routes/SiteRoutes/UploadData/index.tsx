import React, { useState, useEffect } from "react";
import { Container, makeStyles, Theme } from "@material-ui/core";
import { RouteComponentProps, useHistory } from "react-router-dom";
import { DropzoneProps } from "react-dropzone";
import { uniqBy, reduce, mapValues } from "lodash";
import { useSelector } from "react-redux";

import NavBar from "../../../common/NavBar";
import Header from "./Header";
import Selectors from "./Selectors";
import DropZone from "./DropZone";
import FileList from "./FileList";
import HistoryTable from "./HistoryTable";
import StatusSnackbar from "../../../common/StatusSnackbar";
import UploadButton from "./UploadButton";
import { useSiteRequest } from "../../../hooks/useSiteRequest";
import { SiteUploadHistory, Sources } from "../../../store/Sites/types";
import uploadServices, {
  UploadTimeSeriesResult,
} from "../../../services/uploadServices";
import { userInfoSelector } from "../../../store/User/userSlice";
import siteServices from "../../../services/siteServices";

const UploadData = ({ match, onSuccess }: MatchProps) => {
  const classes = useStyles();
  const history = useHistory();
  const { token } = useSelector(userInfoSelector) || {};
  const { site, siteLoading } = useSiteRequest(match.params.id);
  const [isSelectionCompleted, setIsSelectionCompleted] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sources>();
  const [selectedPoint, setSelectedPoint] = useState<number>();
  const [files, setFiles] = useState<File[]>([]);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadError, setUploadError] = useState<string>();
  const [uploadErrors, setUploadErrors] = useState<
    Record<string, string | null>
  >({});
  const [uploadHistory, setUploadHistory] = useState<SiteUploadHistory>([]);
  const [isUploadHistoryLoading, setIsUploadHistoryLoading] = useState(false);
  const [isUploadHistoryErrored, setIsUploadHistoryErrored] = useState(false);
  const loading = !site || siteLoading || isUploadHistoryLoading;

  const onCompletedSelection = () => setIsSelectionCompleted(true);

  const onFileDelete = (name: string) =>
    setFiles(files.filter((file) => file.name !== name));

  const onFilesDrop: DropzoneProps["onDropAccepted"] = (
    acceptedFiles: File[]
  ) => {
    const newFiles = uniqBy([...files, ...acceptedFiles], "name");
    setFiles(newFiles);
    setUploadErrors(
      reduce(
        newFiles,
        (accum, { name }) => ({ ...accum, [name]: null }),
        uploadErrors
      )
    );
  };

  const clearUploadErrors = () =>
    setUploadErrors(mapValues(uploadErrors, () => null));

  const onStatusSnackbarClose = () => setUploadError(undefined);
  const onHistorySnackbarClose = () => setIsUploadHistoryErrored(false);

  const onUpload = async () => {
    setUploadLoading(true);
    setUploadError(undefined);
    clearUploadErrors();
    try {
      if (
        typeof site?.id === "number" &&
        typeof selectedPoint === "number" &&
        selectedSensor
      ) {
        const data = new FormData();
        files.forEach((file) => data.append("files", file));
        data.append("sensor", selectedSensor);
        const { data: uploadResponse } =
          await uploadServices.uploadTimeSeriesData(
            data,
            site.id,
            selectedPoint,
            token,
            true
          );
        // eslint-disable-next-line fp/no-mutating-methods
        history.push(`/sites/${site.id}`);
        onSuccess(uploadResponse);
      }
    } catch (err) {
      setUploadLoading(false);
      const errorMessage = (err?.response?.data?.message as string) || "";
      const [maybeFileName, maybeFileError] = errorMessage?.split(": ");
      if (maybeFileName in uploadErrors) {
        // File specific error
        setUploadErrors({ ...uploadErrors, [maybeFileName]: maybeFileError });
      } else {
        // General error
        setUploadError(errorMessage || "Something went wrong");
      }
    }
  };

  useEffect(() => {
    const getUploadHistory = async () => {
      setIsUploadHistoryLoading(true);
      setIsUploadHistoryErrored(false);
      try {
        if (site) {
          const { data } = await siteServices.getSiteUploadHistory(site.id);
          setUploadHistory(data);
        }
      } catch {
        setIsUploadHistoryErrored(true);
      } finally {
        setIsUploadHistoryLoading(false);
      }
    };

    getUploadHistory();
  }, [site]);

  return (
    <>
      <NavBar searchLocation={false} loading={loading} />
      <StatusSnackbar
        open={isUploadHistoryErrored}
        message="Failed to fetch upload history"
        handleClose={onHistorySnackbarClose}
        severity="error"
      />
      <StatusSnackbar
        open={!!uploadError}
        message={uploadError}
        handleClose={onStatusSnackbarClose}
        severity="error"
      />

      {site && (
        <Container className={classes.root}>
          <Header site={site} />
          <Selectors
            site={site}
            onCompletedSelection={onCompletedSelection}
            onSensorChange={setSelectedSensor}
            onPointChange={setSelectedPoint}
          />
          {isSelectionCompleted && (
            <DropZone disabled={uploadLoading} onFilesDrop={onFilesDrop} />
          )}
          {files.length > 0 && (
            <>
              <FileList
                files={files}
                errors={uploadErrors}
                loading={uploadLoading}
                onFileDelete={onFileDelete}
              />
              <UploadButton loading={uploadLoading} onUpload={onUpload} />
            </>
          )}
          <HistoryTable site={site} uploadHistory={uploadHistory} />
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

interface MatchProps extends RouteComponentProps<{ id: string }> {
  onSuccess: (arg: UploadTimeSeriesResult[]) => void;
}

export default UploadData;
