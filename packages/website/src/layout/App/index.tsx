import React, { useState, useEffect } from 'react';
import {
  ThemeProvider,
  Theme,
  StyledEngineProvider,
} from '@mui/material/styles';
import {
  BrowserRouter as Router,
  Routes,
  Navigate,
  Route,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { getSelf } from 'store/User/userSlice';
import { useGATagManager } from 'utils/google-analytics';
import LandingPage from 'routes/Landing';
import Terms from 'routes/Terms';
import Uploads from 'routes/Uploads';
import SpotterInfo from 'routes/SpotterInfo';
import MonitoringRoutes from 'routes/MonitoringRoutes';
import NotFound from 'routes/NotFound';
import HomeMap from 'routes/HomeMap';
import SiteRoutes from 'routes/SiteRoutes';
import About from 'routes/About';
import RegisterSite from 'routes/RegisterSite';
import Buoy from 'routes/Buoy';
import Drones from 'routes/Drones';
import Faq from 'routes/Faq';
import Dashboard from 'routes/Dashboard';
import Spotter from 'routes/Spotter';
import Tracker from 'routes/Tracker';
import app from '../../firebase';
import ErrorBoundary from './ErrorBoundary';
import theme from './theme';

import 'leaflet/dist/leaflet.css';
import './App.css';
import '../../assets/css/bootstrap.css';

declare module '@mui/styles/defaultTheme' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface DefaultTheme extends Theme {}
}

function App() {
  const [render, setRender] = useState<boolean>(false);
  const dispatch = useDispatch();
  useGATagManager();

  useEffect(() => {
    if (app) {
      const auth = getAuth(app);
      onAuthStateChanged(auth, (user) => {
        if (user) {
          // User is signed in
          user
            .getIdToken()
            .then((token) => {
              dispatch(getSelf(token));
            })
            .catch(console.error);
        }
      });
    }
    setRender(true);
  }, [dispatch]);

  return (
    <StyledEngineProvider injectFirst>
      (
      <ThemeProvider theme={theme}>
        <Router>
          <ErrorBoundary>
            <div id="app">
              {render && (
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/map" element={<HomeMap />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/register" element={<RegisterSite />} />
                  <Route path="/buoy" element={<Buoy />} />
                  <Route path="/drones" element={<Drones />} />
                  <Route path="/faq" element={<Faq />} />
                  <Route path="/terms" element={<Terms />} />
                  <Route
                    path="/reefs/:id"
                    element={<Navigate to="/" replace />}
                  />
                  <Route path="/sites/*" element={<SiteRoutes />} />
                  <Route path="/uploads" element={<Uploads />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/spotter" element={<Spotter />} />
                  <Route path="/tracker" element={<Tracker />} />
                  <Route
                    path="/collections/:collectionName"
                    element={<Dashboard />}
                  />
                  <Route path="/spotter-info" element={<SpotterInfo />} />
                  <Route path="/monitoring/*" element={<MonitoringRoutes />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              )}
            </div>
          </ErrorBoundary>
        </Router>
      </ThemeProvider>
      )
    </StyledEngineProvider>
  );
}

export default App;
