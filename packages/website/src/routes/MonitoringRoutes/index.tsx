import React from 'react';
import NavBar from 'common/NavBar';
import { Route, Switch } from 'react-router-dom';
import SiteMetrics from './SiteMetrics';
import MonthlyReport from './MonthlyReport';
import Monitoring from './Monitoring';
import SurveysReport from './SurveysReport';
import SitesOverview from './SitesOverview';
import SitesStatus from './SitesStatus';

function MonitoringRoutes() {
  return (
    <>
      <NavBar searchLocation={false} />
      <Switch>
        <Route exact path="/monitoring" component={Monitoring} />
        <Route exact path="/monitoring/site-metrics" component={SiteMetrics} />
        <Route
          exact
          path="/monitoring/monthly-report"
          component={MonthlyReport}
        />
        <Route
          exact
          path="/monitoring/surveys-report"
          component={SurveysReport}
        />
        <Route
          exact
          path="/monitoring/sites-overview"
          component={SitesOverview}
        />
        <Route exact path="/monitoring/sites-status" component={SitesStatus} />
      </Switch>
    </>
  );
}

export default MonitoringRoutes;
