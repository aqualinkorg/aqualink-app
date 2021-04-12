import React, { useState, useEffect } from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useDispatch } from "react-redux";

import NotFound from "../../routes/NotFound";
import ErrorBoundary from "./ErrorBoundary";
import LandingPage from "../../routes/Landing";
import HomeMap from "../../routes/HomeMap";
import ReefRoutes from "../../routes/ReefRoutes";
import About from "../../routes/About";
import RegisterSite from "../../routes/RegisterSite";
import Buoy from "../../routes/Buoy";
import Drones from "../../routes/Drones";
import Faq from "../../routes/Faq";
import Dashboard from "../../routes/Dashboard";
import theme from "./theme";
import "leaflet/dist/leaflet.css";
import "./App.css";
import "../../assets/css/bootstrap.css";
import { getSelf } from "../../store/User/userSlice";
import app from "../../firebase";
import { initGA } from "../../utils/google-analytics";
import Terms from "../../routes/Terms";

function App() {
  const [render, setRender] = useState<boolean>(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (app) {
      app.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in
          user.getIdToken().then((token) => {
            dispatch(getSelf(token));
          });
        }
      });
    }
    setRender(true);
    initGA();
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
                <Route path="/reefs" component={ReefRoutes} />
                <Route exact path="/dashboard" component={Dashboard} />
                <Route default component={NotFound} />
              </Switch>
            )}
          </div>
        </ErrorBoundary>
      </Router>
    </ThemeProvider>
  );
}

export default App;
