import Surveys from 'routes/Surveys';
import { getSites } from 'services/metadataServices';

export const generateStaticParams = async () => {
  const { data: sites } = await getSites();
  return sites.map(({ id }) => ({ id: `${id}` }));
};

export default function NewSurveyPage() {
  return <Surveys />;
}
