import {
  Alert,
  Box,
  Checkbox,
  Container,
  FormControlLabel,
  Grid,
  TextField,
  Typography,
} from '@mui/material';
import { Theme } from '@mui/material/styles';
import makeStyles from '@mui/styles/makeStyles';
import DropZone from 'common/FileUploads/Dropzone';
import NavBar from 'common/NavBar';
import React from 'react';
import { DropzoneProps } from 'react-dropzone';
import { useSelector } from 'react-redux';
import { useAppDispatch } from 'store/hooks';
import { userInfoSelector } from 'store/User/userSlice';
import FileList from 'common/FileUploads/FileList';
import UploadButton from 'common/FileUploads/UploadButton';
import {
  uploadMultiSiteFiles,
  uploadsErrorSelector,
  uploadsInProgressSelector,
  uploadsResponseSelector,
} from 'store/uploads/uploadsSlice';
import StatusSnackbar from 'common/StatusSnackbar';
import { UploadTimeSeriesResult } from 'services/uploadServices';
import UploadWarnings from 'common/FileUploads/UploadWarnings';
import { useNavigate } from 'react-router-dom';
import { Sources } from 'store/Sites/types';
import SitesTable from './SitesTable';
import { OptionsList, selectProps, SENSOR_TYPES } from './utils';

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
}));

function Uploads() {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const [isUploadSnackbarOpen, setIsUploadSnackbarOpen] = React.useState(false);
  const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = React.useState(false);
  const [isUploadDetailsDialogOpen, setIsUploadDetailsDialogOpen] =
    React.useState(false);
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadDetails, setUploadDetails] = React.useState<
    UploadTimeSeriesResult[]
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [selectedSource, setSelectedSource] =
    React.useState<Sources>('sheet_data');
  const [siteTimezone, setSiteTimezone] = React.useState(false);

  const user = useSelector(userInfoSelector);
  const uploadLoading = useSelector(uploadsInProgressSelector);
  const uploadError = useSelector(uploadsErrorSelector);
  const uploadResult = useSelector(uploadsResponseSelector);

  const hasWarnings = uploadDetails.some(
    (data) => (data.ignoredHeaders?.length ?? 0) > 0,
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
    navigate(`/map`);
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
    dispatch(
      uploadMultiSiteFiles({
        files,
        token: user?.token,
        source: selectedSource,
        siteTimezone,
      }),
    );
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
          <Grid item md={4} xs={12}>
            <TextField
              label="Sensor type"
              value={SENSOR_TYPES.findIndex((x) => x.name === selectedSource)}
              onChange={(e) => {
                setSelectedSource(
                  SENSOR_TYPES[Number(e.target.value)].name as Sources,
                );
              }}
              variant="outlined"
              fullWidth
              select
              slotProps={{
                select: selectProps,
              }}
            >
              {OptionsList(SENSOR_TYPES)}
            </TextField>
          </Grid>
          <Grid item md={12} xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={siteTimezone}
                  onChange={(e) => setSiteTimezone(e.target.checked)}
                  color="primary"
                />
              }
              label="Use Site Timezone"
            />
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
              Upload in progress. Please DO NOT reload the page. It may take a
              while.
            </Alert>
          </Box>
        )}

        <SitesTable />
      </Container>
    </>
  );
}

export default Uploads;
