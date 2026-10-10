import React from 'react';
import NavBar from 'common/NavBar';
import Hero from './sections/Hero';
import Reach from './sections/Reach';
import Connections from './sections/Connections';
import Buoy from './sections/Buoy';
import Drone from './sections/Drone';
import Surveys from './sections/Surveys';
import Science from './sections/Science';
import Registration from './sections/Registration';
import Footer from './sections/Footer';
import './Landing.scss';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <NavBar routeButtons searchLocation={false} />
      <main id="landing-content">
        <Hero />
        <Reach />
        <Connections />
        <Buoy />
        <Drone />
        <Surveys />
        <Science />
        <Registration />
      </main>
      <Footer />
    </div>
  );
}
