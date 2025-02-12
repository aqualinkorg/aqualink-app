import Apply from 'routes/SiteRoutes/SiteApplication';
import { getSites } from 'services/metadataServices';

export const generateStaticParams = async () => {
  const { data: sites } = await getSites();
  return sites.map(({ id }) => ({ id: `${id}` }));
};

export default function SiteApplicationPage() {
  return <Apply />;
}
