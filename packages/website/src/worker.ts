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
import requests from './helpers/requests';

// Define Collection interface based on what we need
interface Collection {
  id: number;
  name: string;
  sites: Array<{ id: number }>;
}

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
  dashboard: {
    title: 'Your Ocean Monitoring Dashboard - Aqualink',
    description:
      'Monitor your selected ocean sites in one dashboard. View real-time data and track changes in the marine ecosystems you care about.',
  },
  collections: {
    title: 'Ocean Monitoring Collections - Aqualink',
    description:
      'Explore curated collections of ocean monitoring sites. View grouped data from specific regions or projects.',
  },
};

// Collection name to ID mapping, similar to what's used in Dashboard
const collections: Record<string, number> = {
  minderoo: 1,
  'heat-stress': 2, // Special case for heat stress collection
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
      // Use requests helper to fetch site data
      const response = await requests.send<Site>({
        url: `sites/${id}`,
        method: 'GET',
      });
      const site = response.data;

      const { name } = site;
      let featuredImageUrl: string | null | undefined = null;
      let surveys: SurveyListItem[] = [];

      if (name) {
        // eslint-disable-next-line fp/no-mutation
        title = `Aqualink Site - ${name}`;
      }

      // Try fetching surveys separately
      try {
        const surveysResponse = await requests.send<SurveyListItem[]>({
          url: `sites/${id}/surveys`,
          method: 'GET',
        });
        surveys = surveysResponse.data;
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
  } else if (firstSegment === 'collections' && id) {
    try {
      // Check if id is a collection name or a numeric id
      const collectionId = Number.isNaN(Number(id))
        ? collections[id.toLowerCase()] // Handle string name lookup
        : Number(id); // Handle numeric id directly

      // Handle special case for heat-stress
      const isHeatStress = id === 'heat-stress';

      let collectionResponse;
      let collection: Collection;
      if (collectionId && !isHeatStress) {
        collectionResponse = await requests.send<Collection>({
          url: `collections/public/${collectionId}`,
          method: 'GET',
        });
        collection = collectionResponse.data;
      } else if (isHeatStress) {
        collectionResponse = await requests.send<Collection>({
          url: 'collections/heat-stress-tracker',
          method: 'GET',
        });
        collection = collectionResponse.data;
      } else {
        throw new Error(`Invalid collection identifier: ${id}`);
      }

      // Update title with collection name
      if (collection.name) {
        // eslint-disable-next-line fp/no-mutation
        title = `Aqualink Collection - ${collection.name}`;
      }

      // Build meta tags
      const siteCount = collection.sites?.length || 0;
      const collectionDescription = `View ${siteCount} ocean monitoring sites in the ${collection.name} collection. Real-time data from Aqualink's global monitoring network.`;

      const meta = `
<title>${title}</title>
<meta name="description" content="${collectionDescription}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${collectionDescription}" />
`;

      const html = indexHtml.replace('<!-- server rendered meta -->', meta);
      return c.html(html);
    } catch (error) {
      console.error(`Failed to fetch collection ${id}:`, error);
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
