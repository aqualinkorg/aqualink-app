import { ReefCheckSurveyViewPage } from 'routes/SiteRoutes/ReefCheckSurveys';
import { getReefCheckSurveys } from 'services/metadataServices';

type PageProps = {
  params: Promise<{ id: string; sid: string }>;
};

export const generateStaticParams = async () => {
  const { data: surveys } = await getReefCheckSurveys();
  return surveys.map(({ id, siteId }) => ({ id: `${siteId}`, sid: `${id}` }));
};

export default async function ReefCheckSurveyPage({ params }: PageProps) {
  const { id, sid } = await params;
  return <ReefCheckSurveyViewPage siteId={id} surveyId={sid} />;
}
