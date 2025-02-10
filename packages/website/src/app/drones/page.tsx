import { droneImage } from 'assets/metadata';
import { Metadata } from 'next';
import Drones from 'routes/Drones';

export const metadata: Metadata = {
  title: 'Aqualink Drone | An Autonomous Surface Vehicle',
  description:
    "Explore Aqualink's underwater drone technology for ocean conservation, monitoring marine ecosystems to help protect and preserve our oceans.",
  openGraph: {
    images: [droneImage],
  },
};

export default function DronesPage() {
  return <Drones />;
}
