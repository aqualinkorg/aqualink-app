import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import theme from "./theme";
import Form from "./Form";
import NotFound from "./NotFound";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div id="app">
          <Switch>
            {/* Redirect the home to Aqualink website */}
            <Route
              exact
              path="/"
              component={() => {
                window.location.replace("https://www.aqualink.org/");
                return null;
              }}
            />
            <Route exact path="/:appId/:uid" component={Form} />

            <Route default component={NotFound} />
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
