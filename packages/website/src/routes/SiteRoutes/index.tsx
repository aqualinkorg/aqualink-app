import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";

import Site from "./Site";
import SiteApplication from "./SiteApplication";
import SitesList from "./SitesList";
import Surveys from "../Surveys";
import SurveyPoint from "./SurveyPoint";
import UploadData from "./UploadData";
import StatusSnackbar from "../../common/StatusSnackbar";
import { UploadTimeSeriesResult } from "../../services/uploadServices";
import DetailsDialog from "./UploadData/DetailsDialog";

const SiteRoutes = () => {
  const [isUploadSuccessSnackbarOpen, setIsUploadSuccessSnackbarOpen] =
    useState(false);
  const [isUploadDetailsDialogOpen, setIsUploadDetailsDialogOpen] =
    useState(false);
  const [uploadDetails, setUploadDetails] = useState<UploadTimeSeriesResult[]>(
    []
  );

  const displayUploadDetails = uploadDetails.some(
    (data) => data.ignoredHeaders.length > 0
  );

  const handleSnackbarClose = () => setIsUploadSuccessSnackbarOpen(false);
  const handleDetailsDialogOpen = () => {
    setIsUploadDetailsDialogOpen(true);
    setIsUploadSuccessSnackbarOpen(false);
  };
  const handleDetailsDialogClose = () => setIsUploadDetailsDialogOpen(false);

  const onUploadSuccess = (data: UploadTimeSeriesResult[]) => {
    setUploadDetails(data);
    setIsUploadSuccessSnackbarOpen(true);
  };

  return (
    <>
      {isUploadSuccessSnackbarOpen && (
        <StatusSnackbar
          message="Successfully uploaded files"
          severity="success"
          furtherActionLabel="View details"
          onFurtherActionTake={handleDetailsDialogOpen}
          handleClose={handleSnackbarClose}
        />
      )}
      <DetailsDialog
        details={uploadDetails}
        open={displayUploadDetails && isUploadDetailsDialogOpen}
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
