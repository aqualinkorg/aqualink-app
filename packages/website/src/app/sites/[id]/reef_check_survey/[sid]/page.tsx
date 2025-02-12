import { ReefCheckSurveyViewPage } from 'routes/SiteRoutes/ReefCheckSurveys';
import { getReefCheckSurveys } from 'services/metadataServices';

export const generateStaticParams = async () => {
  const { data: surveys } = await getReefCheckSurveys();
  return surveys.map(({ id, siteId }) => ({ id: `${siteId}`, sid: `${id}` }));
};

export default function ReefCheckSurveyPage() {
  return <ReefCheckSurveyViewPage />;
}
