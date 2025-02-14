import { dashboardImage } from 'assets/metadata';
import { Metadata } from 'next';
import Faq from 'routes/Faq';

export const metadata: Metadata = {
  title: 'Aqualink FAQ | Common Questions About Our Ocean Monitoring Platform',
  description:
    "Answers to frequently asked questions about Aqualink's real-time ocean monitoring system, reef data, how to use the platform, and how to monitor your reef.",
  openGraph: {
    images: [dashboardImage],
  },
};

export default function FaqPage() {
  return <Faq />;
}
