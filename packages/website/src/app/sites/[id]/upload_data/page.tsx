import UploadData from 'routes/SiteRoutes/UploadData';
import { getSites } from 'services/metadataServices';

export const generateStaticParams = async () => {
  const { data: sites } = await getSites();
  return sites.map(({ id }) => ({ id: `${id}` }));
};

export default function UploadDataPage() {
  return <UploadData />;
}
