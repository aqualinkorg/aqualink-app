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
  // Home page
  '': {
    title: 'Free Data Management Platform for Monitoring of Marine Ecosystems',
    description:
      'Integrate data from sensors and surveys to create an instant view of your marine ecosystem. Explore our interactive map & dashboards using advanced ocean technology.',
  },
  // Routes
  about: {
    title: 'About Us - Aqualink',
    description:
      "Learn how Aqualink's ocean monitoring technology helps protect coral reefs and marine ecosystems by providing real-time data to researchers worldwide.",
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
    title: 'Aqualink Map | Interactive Ocean Monitoring for Marine Ecosystems',
    description:
      "Explore Aqualink's interactive ocean map! View live ocean temperatures and coral reef data globally. Track heat wave & heat stress in marine ecosystems.",
  },
  dashboard: {
    title: 'Your Ocean Monitoring Dashboard - Aqualink',
    description:
      'Monitor your selected ocean sites in one dashboard. View real-time data and track changes in the marine ecosystems you care about.',
  },
  collections: {
    title: '{collectionName} - Ocean Monitoring Collection',
    description:
      "View ocean monitoring sites in the {collectionName} collection. Real-time data from Aqualink's global monitoring network.",
  },
  tracker: {
    title: 'Tracking Ocean Heat Waves and Coral Bleaching Globally and Locally',
    description:
      'Track ocean Heat Waves and Heat Stress on Aqualink. Access global data and surveys for coral bleaching and coral reef health tracking.',
  },
  faq: {
    title:
      'Aqualink FAQ | Common Questions About Our Ocean Monitoring Platform',
    description:
      "Answers to frequently asked questions about Aqualink's real-time ocean monitoring system, reef data, how to use the platform, and how to monitor your reef.",
  },
  register: {
    title: 'Register sites on Aqualink and get dashboards with real-time data',
    description:
      'Register the reef you want to monitor in 1 minute. Your dashboard will come with real-time temperature, wind, and wave data. Add surveys and data publicly.',
  },
  sites: {
    title: 'Monitoring {siteName} | Aqualink Dashboard',
    description:
      'View real-time data for {siteName}, including reef health, ocean temperature, wind and wave conditions. Monitor your local marine ecosystem with Aqualink.',
  },
};

// Collection name to ID mapping, similar to what's used in Dashboard
const collections: Record<string, number> = {
  minderoo: 1,
  'heat-stress': 2, // Special case for heat stress collection
  Bermuda: 746,
  MNMRC: 766,
  HOKWO: 778,
  Palau: 779,
  Brazil: 787,
  Caribbean: 804,
  SuperNOVA: 805,
  Florida_Keys: 811,
  TNC: 837,
  Hawaii: 838,
  Malaysia: 839,
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
  const firstSegment = pathname.split('/').filter(Boolean)[0] || '';
  const id = pathname.split('/').filter(Boolean)[1];

  let title = metadata[firstSegment]?.title || 'Aqualink';
  let description = metadata[firstSegment]?.description || 'Ocean Monitoring';

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
        title = metadata.sites.title.replace('{siteName}', name);
        // eslint-disable-next-line fp/no-mutation
        description = metadata.sites.description.replace('{siteName}', name);
      }

      // Try fetching surveys separately
      try {
        const surveysResponse = await requests.send<SurveyListItem[]>({
          url: `sites/${id}/surveys`,
          method: 'GET',
        });
        // eslint-disable-next-line fp/no-mutation
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

      const meta = `
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
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
        // eslint-disable-next-line fp/no-mutation
        collectionResponse = await requests.send<Collection>({
          url: `collections/public/${collectionId}`,
          method: 'GET',
        });
        // eslint-disable-next-line fp/no-mutation
        collection = collectionResponse.data;
      } else if (isHeatStress) {
        // eslint-disable-next-line fp/no-mutation
        collectionResponse = await requests.send<Collection>({
          url: 'collections/heat-stress-tracker',
          method: 'GET',
        });
        // eslint-disable-next-line fp/no-mutation
        collection = collectionResponse.data;
      } else {
        throw new Error(`Invalid collection identifier: ${id}`);
      }

      // Update title with collection name
      if (collection.name) {
        // eslint-disable-next-line fp/no-mutation
        title = metadata.collections.title.replace(
          '{collectionName}',
          collection.name,
        );

        // Build description with site count and collection name
        const siteCount = collection.sites?.length || 0;
        // eslint-disable-next-line fp/no-mutation
        description = metadata.collections.description
          .replace('{collectionName}', collection.name)
          .replace(
            'ocean monitoring sites',
            `${siteCount} ocean monitoring sites`,
          );
      }

      const meta = `
<title>${title}</title>
<meta name="description" content="${description}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
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

  // we need to inject new meta in between the comment tags so to replace the default title/description
  const html = indexHtml
    .split('<!-- server rendered meta -->')
    .map((part, i) => (i === 1 ? meta : part))
    .join('');
  return c.html(html);
});

export default app;
