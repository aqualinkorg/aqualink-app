import React, { useState, useEffect } from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import {
  BrowserRouter as Router,
  Switch,
  Redirect,
  Route,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getSelf } from 'store/User/userSlice';
import { useGATagManager } from 'utils/google-analytics';
import Uploads from 'routes/Uploads';
import NotFound from '../../routes/NotFound';
import ErrorBoundary from './ErrorBoundary';
import LandingPage from '../../routes/Landing';
import HomeMap from '../../routes/HomeMap';
import SiteRoutes from '../../routes/SiteRoutes';
import About from '../../routes/About';
import RegisterSite from '../../routes/RegisterSite';
import Buoy from '../../routes/Buoy';
import Drones from '../../routes/Drones';
import Faq from '../../routes/Faq';
import Dashboard from '../../routes/Dashboard';
import Tracker from '../../routes/Tracker';
import theme from './theme';
import 'leaflet/dist/leaflet.css';
import './App.css';
import '../../assets/css/bootstrap.css';
import app from '../../firebase';
import Terms from '../../routes/Terms';

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
    <ThemeProvider theme={theme}>
      <Router>
        <ErrorBoundary>
          <div id="app">
            {render && (
              <Switch>
                <Route exact path="/" component={LandingPage} />
                <Route exact path="/map" component={HomeMap} />
                <Route exact path="/about" component={About} />
                <Route exact path="/register" component={RegisterSite} />
                <Route exact path="/buoy" component={Buoy} />
                <Route exact path="/drones" component={Drones} />
                <Route exact path="/faq" component={Faq} />
                <Route exact path="/terms" component={Terms} />
                <Redirect from="/reefs/:id" to="/sites/:id" />
                <Route path="/sites" component={SiteRoutes} />
                <Route exact path="/uploads" component={Uploads} />
                <Route exact path="/dashboard" component={Dashboard} />
                <Route exact path="/tracker" component={Tracker} />
                <Route
                  exact
                  path="/collections/:collectionName"
                  component={Dashboard}
                />
                <Route path="*" component={NotFound} />
              </Switch>
            )}
          </div>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
