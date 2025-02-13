import SurveyPoint from 'routes/SiteRoutes/SurveyPoint';
import { getSitePoints } from 'services/metadataServices';

type PageProps = {
  params: Promise<{ id: string; pointId: string }>;
};

export const generateStaticParams = async () => {
  const { data: sites } = await getSitePoints();
  return sites.map(({ id, siteId }) => ({ id: `${siteId}`, pointId: `${id}` }));
};

export default async function SurveyPointPage({ params }: PageProps) {
  const { id, pointId } = await params;
  return <SurveyPoint siteId={id} pointId={pointId} />;
}
