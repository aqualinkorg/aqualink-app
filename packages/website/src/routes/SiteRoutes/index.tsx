import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";

import Site from "./Site";
import SiteApplication from "./SiteApplication";
import SitesList from "./SitesList";
import Surveys from "../Surveys";
import SurveyPoint from "./SurveyPoint";
import UploadData from "./UploadData";
import StatusSnackbar from "../../common/StatusSnackbar";
import UploadWarnings from "./UploadData/UploadWarnings";
import { UploadTimeSeriesResult } from "../../services/uploadServices";

const SiteRoutes = () => {
  const [isUploadSnackbarOpen, setIsUploadSnackbarOpen] = useState(false);
  const [isUploadDetailsDialogOpen, setIsUploadDetailsDialogOpen] =
    useState(false);
  const [uploadDetails, setUploadDetails] = useState<UploadTimeSeriesResult[]>(
    []
  );

  const hasWarnings = uploadDetails.some((data) => data.ignoredHeaders.length);

  const handleSnackbarClose = () => setIsUploadSnackbarOpen(false);
  const handleDetailsDialogOpen = () => setIsUploadDetailsDialogOpen(true);
  const handleDetailsDialogClose = () => setIsUploadDetailsDialogOpen(false);

  const onUploadSuccess = (data: UploadTimeSeriesResult[]) => {
    setUploadDetails(data);
    setIsUploadSnackbarOpen(true);
  };

  return (
    <>
      <StatusSnackbar
        open={isUploadSnackbarOpen}
        message="Successfully uploaded files"
        severity={hasWarnings ? "warning" : "success"}
        furtherActionLabel={hasWarnings ? "View details" : undefined}
        onFurtherActionTake={hasWarnings ? handleDetailsDialogOpen : undefined}
        handleClose={handleSnackbarClose}
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
            <UploadData {...props} onSuccess={onUploadSuccess} />
          )}
        />
      </Switch>
    </>
  );
};

export default SiteRoutes;
