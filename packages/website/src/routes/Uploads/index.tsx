import { Box, Container, Grid, Typography } from '@material-ui/core';
import { makeStyles, Theme } from '@material-ui/core/styles';
import DropZone from 'common/FileUploads/Dropzone';
import NavBar from 'common/NavBar';
import React from 'react';
import { DropzoneProps } from 'react-dropzone';
import { useDispatch, useSelector } from 'react-redux';
import { userInfoSelector } from 'store/User/userSlice';
import FileList from 'common/FileUploads/FileList';
import UploadButton from 'common/FileUploads/UploadButton';
import {
  uploadMultiSiteFiles,
  uploadsErrorSelector,
  uploadsInProgressSelector,
  uploadsResponseSelector,
} from 'store/uploads/uploadsSlice';
import { Alert } from '@material-ui/lab';
import StatusSnackbar from 'common/StatusSnackbar';
import { UploadTimeSeriesResult } from 'services/uploadServices';
import UploadWarnings from 'common/FileUploads/UploadWarnings';
import { useHistory } from 'react-router-dom';
import SitesTable from './SitesTable';

function Uploads() {
  const classes = useStyles();
  const dispatch = useDispatch();
  const history = useHistory();

  const [isUploadSnackbarOpen, setIsUploadSnackbarOpen] = React.useState(false);
  const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = React.useState(false);
  const [isUploadDetailsDialogOpen, setIsUploadDetailsDialogOpen] =
    React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadDetails, setUploadDetails] = React.useState<
    UploadTimeSeriesResult[]
  >([]);

  const user = useSelector(userInfoSelector);
  const uploadLoading = useSelector(uploadsInProgressSelector);
  const uploadError = useSelector(uploadsErrorSelector);
  const uploadResult = useSelector(uploadsResponseSelector);

  const hasWarnings = uploadDetails.some(
    (data) => (data.ignoredHeaders?.length || 0) > 0,
  );

  React.useEffect(() => {
    if (uploadResult && !uploadLoading && !uploadError) {
      setUploadDetails(uploadResult);
      if (!uploadResult.some((x) => !!x.error)) {
        setIsUploadSnackbarOpen(true);
      }
    }
  }, [uploadResult, uploadLoading, uploadError]);

  React.useEffect(() => {
    setIsErrorSnackbarOpen(!!uploadError);
  }, [uploadError]);

  const handleSnackbarClose = () => setIsUploadSnackbarOpen(false);
  const handleDetailsDialogOpen = () => setIsUploadDetailsDialogOpen(true);
  const handleDetailsDialogClose = () => setIsUploadDetailsDialogOpen(false);
  const onStatusSnackbarClose = () => setIsErrorSnackbarOpen(false);

  const handleRefreshOnSuccessUpload = () => {
    // eslint-disable-next-line fp/no-mutating-methods
    history.push(`/map`);
  };

  const onFilesDrop: DropzoneProps['onDropAccepted'] = (
    acceptedFiles: File[],
  ) => {
    const uniqueByName = [
      ...new Map(acceptedFiles.map((x) => [x.name, x])).values(),
    ];
    setFiles(uniqueByName);
  };

  const onFileDelete = (name: string) => {
    setFiles(files.filter((file) => file.name !== name));
  };

  const onUpload = () => {
    dispatch(uploadMultiSiteFiles({ files, token: user?.token }));
  };

  return (
    <>
      <StatusSnackbar
        open={isUploadSnackbarOpen}
        message="Successfully uploaded files"
        severity={hasWarnings ? 'warning' : 'success'}
        furtherActionLabel={hasWarnings ? 'View details' : 'Go to map'}
        onFurtherActionTake={
          hasWarnings ? handleDetailsDialogOpen : handleRefreshOnSuccessUpload
        }
        handleClose={handleSnackbarClose}
      />
      <StatusSnackbar
        open={isErrorSnackbarOpen}
        message={
          typeof uploadError === 'string'
            ? uploadError
            : 'Something went wrong with the upload'
        }
        furtherActionLabel="View details"
        handleClose={onStatusSnackbarClose}
        severity="error"
      />
      <UploadWarnings
        details={uploadDetails}
        open={hasWarnings && isUploadDetailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
      <NavBar searchLocation={false} />
      <Container className={classes.root}>
        <Grid container alignItems="center" spacing={1}>
          <Grid item>
            <Typography variant="h5">Upload Data</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="h6">
              You&apos;re about to upload data for multiple sites.
            </Typography>
            <Typography variant="h6">
              The file to be upload should include:
              <ul>
                <li>
                  <code>aqualink_site_id</code>
                </li>
                <li>
                  <code>aqualink_survey_point_id</code> (optional)
                </li>
                <li>
                  <code>aqualink_sensor_type</code> (optional, valid types are:{' '}
                  <code>hobo</code>, <code>sonde</code>, <code>spotter</code>,{' '}
                  <code>metlog</code>, <code>sheet_data</code>)
                </li>
              </ul>
            </Typography>
            <Typography style={{ fontSize: '0.8em' }}>
              For more information about uploading data, visit our&nbsp;
              <a
                href="https://aqualink.org/faq"
                target="_blank"
                rel="noopener noreferrer"
              >
                FAQ page
              </a>
              .
            </Typography>
          </Grid>
        </Grid>

        <DropZone disabled={uploadLoading} onFilesDrop={onFilesDrop} />

        {files.length > 0 && (
          <>
            <FileList files={files} onFileDelete={onFileDelete} />
            <UploadButton loading={uploadLoading} onUpload={onUpload} />
          </>
        )}

        {uploadLoading && (
          <Box mb="20px" style={{ paddingTop: '1em' }}>
            <Alert severity="info">
              Upload in progress. please DO NOT reload the page, it may take a
              while.
            </Alert>
          </Box>
        )}

        <SitesTable />
      </Container>
    </>
  );
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

export default Uploads;
