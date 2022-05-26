import React, { useState } from "react";
import { Switch, Route, useHistory } from "react-router-dom";
import { useDispatch } from "react-redux";
import Site from "./Site";
import SiteApplication from "./SiteApplication";
import SitesList from "./SitesList";
import Surveys from "../Surveys";
import SurveyPoint from "./SurveyPoint";
import UploadData from "./UploadData";
import StatusSnackbar from "../../common/StatusSnackbar";
import UploadWarnings from "./UploadData/UploadWarnings";
import { UploadTimeSeriesResult } from "../../services/uploadServices";
import { setSelectedSite } from "../../store/Sites/selectedSiteSlice";

const SiteRoutes = () => {
  const dispatch = useDispatch();
  const history = useHistory();
  const [isUploadSnackbarOpen, setIsUploadSnackbarOpen] = useState(false);
  const [isUploadDetailsDialogOpen, setIsUploadDetailsDialogOpen] =
    useState(false);
  const [uploadDetails, setUploadDetails] = useState<UploadTimeSeriesResult[]>(
    []
  );
  const [uploadError, setUploadError] = useState<string | undefined>();
  const [uploadLoading, setUploadLoading] = useState(false);

  const hasWarnings = uploadDetails.some((data) => data.ignoredHeaders.length);

  const handleSnackbarClose = () => setIsUploadSnackbarOpen(false);
  const handleDetailsDialogOpen = () => setIsUploadDetailsDialogOpen(true);
  const handleDetailsDialogClose = () => setIsUploadDetailsDialogOpen(false);
  const onStatusSnackbarClose = () => setUploadError(undefined);
  const [siteId, setSiteId] = useState<number | undefined>(undefined);

  const handleRefreshOnSuccessUpload = () => {
    dispatch(setSelectedSite());
    // eslint-disable-next-line fp/no-mutating-methods
    history.push(`/sites/${siteId}?refresh=true`);
    setIsUploadSnackbarOpen(false);
  };

  const onUploadSuccess = (
    data: UploadTimeSeriesResult[],
    currSiteId?: number
  ) => {
    setSiteId(currSiteId);
    setUploadDetails(data);
    setIsUploadSnackbarOpen(true);
  };

  return (
    <>
      <StatusSnackbar
        open={isUploadSnackbarOpen}
        message="Successfully uploaded files"
        severity={hasWarnings ? "warning" : "success"}
        furtherActionLabel={hasWarnings ? "View details" : "Refresh page"}
        onFurtherActionTake={
          hasWarnings ? handleDetailsDialogOpen : handleRefreshOnSuccessUpload
        }
        handleClose={handleSnackbarClose}
      />
      <StatusSnackbar
        open={!!uploadError}
        message={uploadError}
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
          render={(props) => <Surveys {...props} isView={false} />}
        />
        <Route
          exact
          path="/sites/:id/survey_details/:sid"
          render={(props) => <Surveys {...props} isView />}
        />
        <Route
          exact
          path="/sites/:id/upload_data"
          render={(props) => (
            <UploadData
              {...props}
              onSuccess={onUploadSuccess}
              setUploadError={setUploadError}
              setUploadLoading={setUploadLoading}
            />
          )}
        />
      </Switch>
    </>
  );
};

export default SiteRoutes;
