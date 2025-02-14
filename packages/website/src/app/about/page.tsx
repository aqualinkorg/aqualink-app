import { startPageImage } from 'assets/metadata';
import { Metadata } from 'next';
import About from 'routes/About';

export const metadata: Metadata = {
  title: 'About Us - Aqualink',
  description:
    "Learn about Aqualink's mission, our team, and our efforts in ocean conservation technology.",
  openGraph: {
    images: [startPageImage],
  },
};

export default function AboutPage() {
  return <About />;
}
