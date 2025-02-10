import { dashboardImage } from 'assets/metadata';
import { Metadata } from 'next';
import RegisterSite from 'routes/RegisterSite';

export const metadata: Metadata = {
  title:
    'Register sites on Aqualink and receive dashboards with real-time data',
  description:
    'Register the reef you want to monitor in 1 minute. Your dashboard will come with real-time temperature, wind, and wave data. Add surveys and data publicly.',
  openGraph: {
    images: [dashboardImage],
  },
};

export default function RegisterPage() {
  return <RegisterSite />;
}
