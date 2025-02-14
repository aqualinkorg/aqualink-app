import Site from 'routes/SiteRoutes/Site';
import Apply from 'routes/SiteRoutes/SiteApplication';
import Surveys from 'routes/Surveys';
import SurveyPoint from 'routes/SiteRoutes/SurveyPoint';
import { ReefCheckSurveyViewPage } from 'routes/SiteRoutes/ReefCheckSurveys';
import UploadData from 'routes/SiteRoutes/UploadData';
import Dashboard from 'routes/Dashboard';

interface DynamicRoute {
  regex: RegExp;
  Component: (match: RegExpMatchArray) => JSX.Element;
}

export const DYNAMIC_ROUTES: Array<DynamicRoute> = [
  {
    regex: /^\/collections\/(.+)$/,
    Component: ([, collectionName]: RegExpMatchArray) => (
      <Dashboard urlCollectionName={collectionName} />
    ),
  },
  {
    regex: /^\/sites\/(\d+)$/,
    Component: ([, siteId]: RegExpMatchArray) => <Site siteId={siteId} />,
  },
  {
    regex: /^\/sites\/(\d+)\/apply$/,
    Component: ([, siteId]: RegExpMatchArray) => (
      <Apply siteId={parseInt(siteId, 10)} />
    ),
  },
  {
    regex: /^\/sites\/(\d+)\/new_survey$/,
    Component: ([, siteId]: RegExpMatchArray) => <Surveys siteId={siteId} />,
  },
  {
    regex: /^\/sites\/(\d+)\/points\/(\d+)$/,
    Component: ([, siteId, pointId]: RegExpMatchArray) => (
      <SurveyPoint siteId={siteId} pointId={pointId} />
    ),
  },
  {
    regex: /^\/sites\/(\d+)\/survey_details\/(\d+)$/,
    Component: ([, siteId, surveyId]: RegExpMatchArray) => (
      <Surveys siteId={siteId} surveyId={surveyId} />
    ),
  },
  {
    regex: /^\/sites\/(\d+)\/reef_check_survey\/(.+)$/,
    Component: ([, siteId, surveyId]: RegExpMatchArray) => (
      <ReefCheckSurveyViewPage siteId={siteId} surveyId={surveyId} />
    ),
  },
  {
    regex: /^\/sites\/(\d+)\/upload_data$/,
    Component: ([, siteId]: RegExpMatchArray) => <UploadData siteId={siteId} />,
  },
];
