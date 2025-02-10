import { buoyImage } from 'assets/metadata';
import { Metadata } from 'next';
import Buoy from 'routes/Buoy';

export const metadata: Metadata = {
  title:
    'Aqualink Smart Buoy | Real-time seafloor &amp; sea surface temperature &amp; sea surface temperature',
  description:
    "Aqualink's solar-powered smart buoys collect temperature, wind & wave. Measuring real-time data from seafloor and sea surface. Monitor marine ecosystems.",
  openGraph: {
    images: [buoyImage],
  },
};

export default function BuoyPage() {
  return <Buoy />;
}
