import { startPageImage } from 'assets/metadata';
import { Metadata } from 'next';
import Landing from 'routes/Landing';

export const metadata: Metadata = {
  title: 'Aqualink Ocean Monitoring for Marine Ecosystems. Free &amp; open',
  description:
    'Aqualink is a data management platform for marine ecosystems. Integrate data from sensors and surveys to give you an instant view of your ecosystem. Free',
  openGraph: {
    images: [startPageImage],
  },
};

export default function LandingPage() {
  return <Landing />;
}
