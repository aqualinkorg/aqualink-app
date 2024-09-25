import React, { useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    navigate(`/sites/${uploadTarget?.siteId}/upload_data`);
  };

  const handleRefreshOnSuccessUpload = () => {
    dispatch(setSelectedSite());
    navigate({ pathname: `/sites/${siteId}`, search: 'refresh=true' });
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
      <Routes>
        <Route path="/" element={<SitesList />} />
        <Route path="/:id" element={<Site />} />
        <Route path="/:id/apply" element={<SiteApplication />} />
        <Route path="/:id/points/:pointId" element={<SurveyPoint />} />
        <Route path="/:id/new_survey" element={<Surveys />} />
        <Route path="/:id/survey_details/:sid" element={<Surveys />} />
        <Route path="/:id/upload_data" element={<UploadData />} />
      </Routes>
    </>
  );
};

export default SiteRoutes;
