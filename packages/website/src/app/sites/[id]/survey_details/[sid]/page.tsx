import Surveys from 'routes/Surveys';
import { getSurveys } from 'services/metadataServices';

export async function generateStaticParams() {
  const { data: surveys } = await getSurveys();
  return surveys.map(({ id, siteId }) => ({ id: `${siteId}`, sid: `${id}` }));
}

export default function SurveyDetailsPage() {
  return <Surveys />;
}
