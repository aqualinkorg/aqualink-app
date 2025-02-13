import Site from 'routes/SiteRoutes/Site';
import siteServices from 'services/siteServices';

type PageProps = {
  params: Promise<{ id: string }>;
};

export const generateStaticParams = async () => {
  const { data: sites } = await siteServices.getSites();
  return sites.map(({ id }) => ({ id: `${id}` }));
};

export default async function SitePage({ params }: PageProps) {
  const { id } = await params;
  return <Site siteId={id} />;
}
