import React from "react";
import { Switch, Route } from "react-router-dom";

import Site from "./Site";
import SiteApplication from "./SiteApplication";
import SitesList from "./SitesList";
import Surveys from "../Surveys";
import SurveyPoint from "./SurveyPoint";
import UploadData from "./UploadData";

const SiteRoutes = () => {
  return (
    <Switch>
      <Route exact path="/sites" component={SitesList} />
      <Route exact path="/sites/:id" component={Site} />
      <Route exact path="/sites/:id/apply" component={SiteApplication} />
      <Route exact path="/sites/:id/points/:pointId" component={SurveyPoint} />
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
      <Route exact path="/sites/:id/upload_data" component={UploadData} />
    </Switch>
  );
};

export default SiteRoutes;
