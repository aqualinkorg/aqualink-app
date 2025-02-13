'use client';

import UploadWarnings from 'common/FileUploads/UploadWarnings';
import StatusSnackbar from 'common/StatusSnackbar';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { UploadTimeSeriesResult } from 'services/uploadServices';
import { setSelectedSite } from 'store/Sites/selectedSiteSlice';
import {
  uploadsInProgressSelector,
  uploadsErrorSelector,
  uploadsResponseSelector,
  uploadsTargetSelector,
  clearUploadsFiles,
  clearUploadsTarget,
  clearUploadsError,
  clearUploadsResponse,
} from 'store/uploads/uploadsSlice';

export default function SitesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch();
  const router = useRouter();
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
    router.push(`/sites/${uploadTarget?.siteId}/upload_data`);
  };

  const handleRefreshOnSuccessUpload = () => {
    dispatch(setSelectedSite());
    router.push(`/sites/${siteId}?refresh=true`);
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
      {children}
    </>
  );
}
