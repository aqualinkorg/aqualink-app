import React from 'react';
import NavBar from 'common/NavBar';
import { Route, Routes } from 'react-router-dom';
import SiteMetrics from './SiteMetrics';
import MonthlyReport from './MonthlyReport';
import Monitoring from './Monitoring';
import SurveysReport from './SurveysReport';
import SitesOverview from './SitesOverview';
import SitesStatus from './SitesStatus';
import PromptsEditor from './PromptsEditor';

function MonitoringRoutes() {
  return (
    <>
      <NavBar searchLocation={false} />
      <Routes>
        <Route path="/" element={<Monitoring />} />
        <Route path="/site-metrics" element={<SiteMetrics />} />
        <Route path="/monthly-report" element={<MonthlyReport />} />
        <Route path="/surveys-report" element={<SurveysReport />} />
        <Route path="/sites-overview" element={<SitesOverview />} />
        <Route path="/sites-status" element={<SitesStatus />} />
        <Route path="/prompts" element={<PromptsEditor />} />
      </Routes>
    </>
  );
}

export default MonitoringRoutes;
