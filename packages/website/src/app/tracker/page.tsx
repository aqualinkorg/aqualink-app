import { trackerImage } from 'assets/metadata';
import { Metadata } from 'next';
import Tracker from 'routes/Tracker';

export const metadata: Metadata = {
  title: 'Tracking Ocean Heat Waves and Coral Bleaching Globally and Locally',
  description:
    'Track ocean Heat Waves and Heat Stress on Aqualink. Access global data and surveys for coral bleaching and coral reef health tracking.',
  openGraph: {
    images: [trackerImage],
  },
};

export default function TrackerPage() {
  return <Tracker />;
}
