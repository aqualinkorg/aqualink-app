import React, { useEffect, useState } from 'react';
import { Switch, Route, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedSite } from 'store/Sites/selectedSiteSlice';
import {
  clearUploadsError,
  clearUploadsFiles,
  clearUploadsResponse,
  clearUploadsTarget,
  uploadsErrorSelector,
  uploadsInProgressSelector,
  uploadsResponseSelector,
  uploadsTargetSelector,
} from 'store/uploads/uploadsSlice';
import StatusSnackbar from 'common/StatusSnackbar';
import { UploadTimeSeriesResult } from 'services/uploadServices';
import UploadWarnings from 'common/FileUploads/UploadWarnings';
import Site from './Site';
import SiteApplication from './SiteApplication';
import SitesList from './SitesList';
import Surveys from '../Surveys';
import SurveyPoint from './SurveyPoint';
import UploadData from './UploadData';

const SiteRoutes = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isUploadSnackbarOpen, setIsUploadSnackbarOpen] = useState(false);
  const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false);
  const [isUploadDetailsDialogOpen, setIsUploadDetailsDialogOpen] =
    useState(false);
  const [uploadDetails, setUploadDetails] = useState<UploadTimeSeriesResult[]>(
    [],
  );
  const uploadLoading = useSelector(uploadsInProgressSelector);
  const uploadError = useSelector(uploadsErrorSelector);
  const uploadResult = useSelector(uploadsResponseSelector);
  const uploadTarget = useSelector(uploadsTargetSelector);

  const hasWarnings = uploadDetails.some(
    (data) => (data.ignoredHeaders?.length || 0) > 0,
  );

  const handleSnackbarClose = () => setIsUploadSnackbarOpen(false);
  const handleDetailsDialogOpen = () => setIsUploadDetailsDialogOpen(true);
  const handleDetailsDialogClose = () => setIsUploadDetailsDialogOpen(false);
  const onStatusSnackbarClose = () => setIsErrorSnackbarOpen(false);
  const [siteId, setSiteId] = useState<number | undefined>(undefined);

  const onHandleUploadError = () => {
    // eslint-disable-next-line fp/no-mutating-methods
    history.push(`/sites/${uploadTarget?.siteId}/upload_data`);
  };

  const handleRefreshOnSuccessUpload = () => {
    dispatch(setSelectedSite());
    // eslint-disable-next-line fp/no-mutating-methods
    history.push(`/sites/${siteId}?refresh=true`);
    setIsUploadSnackbarOpen(false);
    dispatch(clearUploadsFiles());
    dispatch(clearUploadsTarget());
    dispatch(clearUploadsError());
    dispatch(clearUploadsResponse());
  };

  useEffect(() => {
    if (uploadResult && !uploadLoading && !uploadError && uploadTarget) {
      setSiteId(uploadTarget.siteId);
      setUploadDetails(uploadResult);
      if (!uploadResult.some((x) => !!x.error)) {
        setIsUploadSnackbarOpen(true);
      }
    }
  }, [uploadResult, uploadLoading, uploadError, uploadTarget]);

  useEffect(() => {
    setIsErrorSnackbarOpen(!!uploadError);
  }, [uploadError]);

  return (
    <>
      <StatusSnackbar
        open={isUploadSnackbarOpen}
        message="Successfully uploaded files"
        severity={hasWarnings ? 'warning' : 'success'}
        furtherActionLabel={hasWarnings ? 'View details' : 'Refresh page'}
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
        onFurtherActionTake={onHandleUploadError}
        handleClose={onStatusSnackbarClose}
        severity="error"
      />
      <StatusSnackbar
        open={uploadLoading}
        message="Uploading files..."
        handleClose={() => {}}
        severity="info"
      />
      <UploadWarnings
        details={uploadDetails}
        open={hasWarnings && isUploadDetailsDialogOpen}
        onClose={handleDetailsDialogClose}
      />
      <Switch>
        <Route exact path="/sites" component={SitesList} />
        <Route exact path="/sites/:id" component={Site} />
        <Route exact path="/sites/:id/apply" component={SiteApplication} />
        <Route
          exact
          path="/sites/:id/points/:pointId"
          component={SurveyPoint}
        />
        <Route
          exact
          path="/sites/:id/new_survey"
          render={(props) => <Surveys {...props} />}
        />
        <Route
          exact
          path="/sites/:id/survey_details/:sid"
          render={(props) => <Surveys {...props} />}
        />
        <Route
          exact
          path="/sites/:id/upload_data"
          render={(props) => <UploadData {...props} />}
        />
      </Switch>
    </>
  );
};

export default SiteRoutes;
