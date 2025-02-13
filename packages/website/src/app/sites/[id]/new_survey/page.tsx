import Surveys from 'routes/Surveys';
import { getSites } from 'services/metadataServices';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const generateStaticParams = async () => {
  const { data: sites } = await getSites();
  return sites.map(({ id }) => ({ id: `${id}` }));
};

export default async function NewSurveyPage({ params }: PageProps) {
  const { id } = await params;
  return <Surveys siteId={id} />;
}
