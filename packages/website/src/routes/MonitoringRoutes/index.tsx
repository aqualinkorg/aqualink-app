import React from 'react';
import NavBar from 'common/NavBar';
import { Route, Switch } from 'react-router-dom';
import SiteMetrics from './SiteMetrics';
import MonthlyReport from './MonthlyReport';
import Monitoring from './Monitoring';
import SurveysReport from './SurveysReport';

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
      </Switch>
    </>
  );
}

export default MonitoringRoutes;
