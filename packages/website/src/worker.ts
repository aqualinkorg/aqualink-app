/**
 * Cloudflare Worker function to pre-render html with site specific metadata.
 * It fetches the index.html from the static assets and injects the metadata into the header.
 * The metadata is fetched either:
 * - from a local object
 * - fetched from external sites API
 */

import { Hono } from 'hono';

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

  if (firstSegment === 'sites') {
    const res = await fetch(
      `https://ocean-systems.uc.r.appspot.com/api/sites/${id}`,
    );
    const site = (await res.json()) as any;
    const { name } = site;

    // eslint-disable-next-line fp/no-mutation
    title = `Aqualink Site ${name}`;
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
