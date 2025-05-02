/**
 * Cloudflare Worker function to pre-render html with site specific metadata.
 * It fetches the index.html from the static assets and injects the metadata into the header.
 * The metadata is fetched either:
 * - from a local object
 * - fetched from external sites API
 */

import { Hono } from 'hono';
import { Site } from './store/Sites/types';
import { SurveyListItem } from './store/Survey/types';
import { sortByDate } from './helpers/dates';

const metadata: Record<string, any> = {
  about: {
    title: 'About Us - Aqualink',
    description:
      "Learn about Aqualink's mission, our team, and our efforts in ocean conservation technology.",
  },
  buoy: {
    title:
      'Aqualink Smart Buoy | Real-time seafloor &amp; sea surface temperature &amp; sea surface temperature',
    description:
      "Aqualink's solar-powered smart buoys collect temperature, wind & wave. Measuring real-time data from seafloor and sea surface. Monitor marine ecosystems.",
  },
  drones: {
    title: 'Aqualink Drone | An Autonomous Surface Vehicle',
    description:
      "Explore Aqualink's underwater drone technology for ocean conservation, monitoring marine ecosystems to help protect and preserve our oceans.",
  },
  map: {
    title: 'Aqualink Map | Explore Ocean Monitoring Sites Worldwide',
    description:
      "Explore Aqualink's global network of ocean monitoring sites. View real-time data on ocean temperatures, marine ecosystems and coral reefs worldwide.",
  },
};

type Bindings = {
  ASSETS: {
    fetch: (request: Request | string) => Promise<Response>;
  };
};

const app = new Hono<{ Bindings: Bindings }>();

app.get('*', async (c) => {
  const request = c.req;

  const url = new URL(request.url);
  const { origin, pathname } = url;
  const firstSegment = pathname.split('/').filter(Boolean)[0];
  const id = pathname.split('/').filter(Boolean)[1];

  let title = metadata[firstSegment]?.title || 'Aqualink';
  const description = metadata[firstSegment]?.description || 'Ocean Monitoring';

  const index = await c.env.ASSETS.fetch(new URL('/', origin).toString());
  const indexHtml = await index.text();

  if (firstSegment === 'sites' && id) {
    try {
      // Revert to direct fetch with specific base URL for worker environment
      const res = await fetch(
        `https://ocean-systems.uc.r.appspot.com/api/sites/${id}`,
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch site: ${res.statusText}`);
      }
      const site = (await res.json()) as Site;
      const { name } = site;
      let featuredImageUrl: string | null | undefined = null;
      let surveys: SurveyListItem[] = [];

      if (name) {
        // eslint-disable-next-line fp/no-mutation
        title = `Aqualink Site - ${name}`;
      }

      // Try fetching surveys separately
      try {
        const resSurveys = await fetch(
          `https://ocean-systems.uc.r.appspot.com/api/sites/${id}/surveys`,
        );
        if (resSurveys.ok) {
          // eslint-disable-next-line fp/no-mutation
          surveys = (await resSurveys.json()) as SurveyListItem[];
        } else {
          console.error(
            `Failed to fetch surveys for site ${id}: ${resSurveys.statusText}`,
          );
        }
      } catch (surveyError) {
        console.error(`Error fetching surveys for site ${id}:`, surveyError);
        // Proceed without survey data if fetch fails
      }

      if (surveys.length > 0) {
        const sortedSurveys = sortByDate(surveys, 'diveDate', 'desc');
        const featuredSurvey = sortedSurveys.find(
          (survey) => survey.featuredSurveyMedia?.type === 'image',
        );
        // eslint-disable-next-line fp/no-mutation
        featuredImageUrl =
          featuredSurvey?.featuredSurveyMedia?.thumbnailUrl ||
          featuredSurvey?.featuredSurveyMedia?.url;
      }

      const imageMeta = featuredImageUrl
        ? `<meta property="og:image" content="${featuredImageUrl}" />`
        : '';

      const descriptionMeta =
        metadata[firstSegment]?.description || 'Ocean Monitoring';
      const meta = `
<title>${title}</title>
<meta name="description" content="${descriptionMeta}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${descriptionMeta}" />
${imageMeta} 
`;

      const html = indexHtml.replace('<!-- server rendered meta -->', meta);
      return c.html(html);
    } catch (error) {
      console.error(`Failed to fetch site ${id}:`, error);
    }
  }

  const meta = `
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
`;

  const html = indexHtml.replace('<!-- server rendered meta -->', meta);
  return c.html(html);
});

export default app;
