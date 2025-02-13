import Apply from 'routes/SiteRoutes/SiteApplication';
import { getSites } from 'services/metadataServices';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const generateStaticParams = async () => {
  const { data: sites } = await getSites();
  return sites.map(({ id }) => ({ id: `${id}` }));
};

export default async function SiteApplicationPage({ params }: PageProps) {
  const { id } = await params;
  return <Apply siteId={Number(id)} />;
}
