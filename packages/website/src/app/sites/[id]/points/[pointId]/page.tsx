import SurveyPoint from 'routes/SiteRoutes/SurveyPoint';
import { getSitePoints } from 'services/metadataServices';

export const generateStaticParams = async () => {
  const { data: sites } = await getSitePoints();
  return sites.map(({ id, siteId }) => ({ id: `${siteId}`, pointId: `${id}` }));
};

export default function SurveyPointPage() {
  return <SurveyPoint />;
}
