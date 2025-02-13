import Surveys from 'routes/Surveys';
import { getSurveys } from 'services/metadataServices';

type PageProps = {
  params: Promise<{ id: string; sid: string }>;
};

export async function generateStaticParams() {
  const { data: surveys } = await getSurveys();
  return surveys.map(({ id, siteId }) => ({ id: `${siteId}`, sid: `${id}` }));
}

export default async function SurveyDetailsPage({ params }: PageProps) {
  const { id, sid } = await params;
  return <Surveys siteId={id} surveyId={sid} />;
}
