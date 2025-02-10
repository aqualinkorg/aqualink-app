import Site from 'routes/SiteRoutes/Site';
import siteServices from 'services/siteServices';

type SiteParams = {
  id: string;
};

const fetchSites = async () => {
  const { data: sites } = await siteServices.getSites();
  return sites;
};

export const generateStaticParams = async (): Promise<SiteParams[]> => {
  return (await fetchSites()).map(({ id }) => ({ id: `${id}` }));
};

export const generateMetadata = async ({
  params,
}: {
  params: Promise<SiteParams>;
}) => {
  const id = parseInt((await params).id, 10);
  // We use the same /sites request, instead of site/:id, because the response is cached (axios-cache)
  const name =
    (await fetchSites()).find((site) => site.id === id)?.name ?? `Site ${id}`;
  return {
    title: `Monitoring ${name} | Aqualink dashboard`,
    description: `View real-time data for ${name}, including reef health, water temperature, wind, and wave conditions. Monitor marine ecosystems with Aqualink.`,
  };
};

export default async function SitePage({
  params,
}: {
  params: Promise<SiteParams>;
}) {
  const { id } = await params;
  return <Site siteId={id} />;
}
