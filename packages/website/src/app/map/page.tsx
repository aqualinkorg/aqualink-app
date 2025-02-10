import { mapImage } from 'assets/metadata';
import { Metadata } from 'next';
import HomeMap from 'routes/HomeMap';

export const metadata: Metadata = {
  title: 'Aqualink Map | Interactive Ocean Monitoring for Marine Ecosystems',
  description:
    "Aqualink's interactive map displays live ocean data for reef health and ocean temperatures globally. View ocean Heat Stress, Heatwave, and SST Anomaly.",
  openGraph: {
    images: [mapImage],
  },
};

export default function MapPage() {
  return <HomeMap />;
}
