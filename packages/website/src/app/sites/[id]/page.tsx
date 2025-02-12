import Site from 'routes/SiteRoutes/Site';
import { getSites } from 'services/metadataServices';

export const generateStaticParams = async () => {
  const { data: sites } = await getSites();
  return sites.map(({ id }) => ({ id: `${id}` }));
};

export default async function SitePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <Site siteId={id} />;
}
