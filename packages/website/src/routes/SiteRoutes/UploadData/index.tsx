import React, { useState, useEffect } from "react";
import { Box, Container, makeStyles, Theme } from "@material-ui/core";
import { Link, RouteComponentProps, useHistory } from "react-router-dom";
import { DropzoneProps } from "react-dropzone";
import { useDispatch, useSelector } from "react-redux";
import { Alert } from "@material-ui/lab";
import NavBar from "../../../common/NavBar";
import Header from "./Header";
import Selectors from "./Selectors";
import DropZone from "./DropZone";
import FileList from "./FileList";
import HistoryTable from "./HistoryTable";
import UploadButton from "./UploadButton";
import { useSiteRequest } from "../../../hooks/useSiteRequest";
import { SiteUploadHistory, Sources } from "../../../store/Sites/types";
import uploadServices from "../../../services/uploadServices";
import { userInfoSelector } from "../../../store/User/userSlice";
import siteServices from "../../../services/siteServices";
import { setSelectedSite } from "../../../store/Sites/selectedSiteSlice";
import { getAxiosErrorMessage } from "../../../helpers/errors";
import StatusSnackbar from "../../../common/StatusSnackbar";
import {
  addUploadsFiles,
  clearUploadsError,
  clearUploadsFiles,
  clearUploadsResponse,
  clearUploadsTarget,
  removeUploadsFiles,
  setUploadsTarget,
  uploadFiles,
  uploadsFilesSelector,
  uploadsInProgressSelector,
  uploadsTargetSelector,
} from "../../../store/uploads/uploadsSlice";
import InfoWithAction from "../../../common/InfoWithAction";

const UploadData = ({ match }: RouteComponentProps<{ id: string }>) => {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();
  const { token } = useSelector(userInfoSelector) || {};
  const { site, siteLoading } = useSiteRequest(match.params.id);
  // const [isSelectionCompleted, setIsSelectionCompleted] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<Sources>();
  const [selectedPoint, setSelectedPoint] = useState<number>();
  // const [files, setFiles] = useState<File[]>([]);
  const files = useSelector(uploadsFilesSelector);
  const uploadTarget = useSelector(uploadsTargetSelector);
  const uploadLoading = useSelector(uploadsInProgressSelector);
  const [isUploadHistoryErrored, setIsUploadHistoryErrored] = useState(false);
  const [deleteError, setDeleteError] = useState<string | undefined>();
  const [uploadHistory, setUploadHistory] = useState<SiteUploadHistory>([]);
  const [isUploadHistoryLoading, setIsUploadHistoryLoading] = useState(false);
  const [shouldShowPage, setShouldShowPage] = useState(true);
  const loading = !site || siteLoading || isUploadHistoryLoading;

  const onCompletedSelection = () => {
    if (site?.id && selectedPoint && selectedSensor) {
      dispatch(
        setUploadsTarget({ siteId: site?.id, selectedSensor, selectedPoint })
      );
    }
  };

  const onFileDelete = (name: string) => {
    dispatch(removeUploadsFiles(name));
    // setFiles(files.filter((file) => file.name !== name));
  };

  const onFilesDrop: DropzoneProps["onDropAccepted"] = (
    acceptedFiles: File[]
  ) => {
    dispatch(addUploadsFiles(acceptedFiles));
    // const newFiles = uniqBy([...files, ...acceptedFiles], "name");
    // setFiles(newFiles);
  };

  const onHistorySnackbarClose = () => setIsUploadHistoryErrored(false);
  const onDeleteSnackbarClose = () => setDeleteError(undefined);

  const onUpload = () => {
    dispatch(uploadFiles(token));
  };

  const onDelete = async (ids: number[]) => {
    setDeleteError(undefined);
    try {
      if (ids.length > 0) {
        await uploadServices.deleteFileTimeSeriesData({ ids }, token);
        // Clear redux selected site before we land on the site page,
        // so that we fetch the updated data.
        dispatch(setSelectedSite());
        if (typeof site?.id === "number") {
          // eslint-disable-next-line fp/no-mutating-methods
          history.push(`/sites/${site.id}`);
        }
      }
    } catch (err) {
      const errorMessage = getAxiosErrorMessage(err);
      setDeleteError(errorMessage || "Something went wrong");
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

  // on component did mount
  useEffect(() => {
    if (
      uploadTarget?.siteId &&
      uploadTarget.siteId !== Number(match.params.id)
    ) {
      if (uploadLoading) {
        setShouldShowPage(false);
      } else {
        dispatch(clearUploadsFiles());
        dispatch(clearUploadsTarget());
        dispatch(clearUploadsError());
        dispatch(clearUploadsResponse());
      }
    }
    if (site?.id && uploadTarget?.siteId && uploadTarget.siteId === site.id) {
      setShouldShowPage(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [site?.id]);

  const onGoBackClick = () => {
    // eslint-disable-next-line fp/no-mutating-methods
    history.push(`/sites/${site?.id}`);
  };

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
        open={!!deleteError}
        message={deleteError}
        handleClose={onDeleteSnackbarClose}
        severity="error"
      />

      {shouldShowPage ? (
        site && (
          <Container className={classes.root}>
            <Header site={site} />
            <Selectors
              site={site}
              onCompletedSelection={onCompletedSelection}
              onSensorChange={setSelectedSensor}
              onPointChange={setSelectedPoint}
            />
            {!!uploadTarget && (
              <DropZone disabled={uploadLoading} onFilesDrop={onFilesDrop} />
            )}
            {files.length > 0 && (
              <>
                <FileList files={files} onFileDelete={onFileDelete} />
                <UploadButton loading={uploadLoading} onUpload={onUpload} />
              </>
            )}
            {uploadLoading && (
              <Box mb="20px" style={{ paddingTop: "1em" }}>
                <Alert severity="info">
                  Upload in progress. please DO NOT reload the page, it may take
                  a while. You can still{" "}
                  <Link to={`/sites/${site?.id}`}>have a look around</Link>
                </Alert>
              </Box>
            )}
            <HistoryTable
              site={site}
              uploadHistory={uploadHistory}
              onDelete={onDelete}
            />
          </Container>
        )
      ) : (
        <InfoWithAction
          message="An upload is already loading. Please wait."
          action={onGoBackClick}
          actionText="Go Back!"
        />
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

export default UploadData;
