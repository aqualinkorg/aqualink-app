import React from "react";
import { ThemeProvider } from "@material-ui/core/styles";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import NotFound from "../../routes/NotFound";
import HomePage from "../../routes/Homepage";
import ReefRoutes from "../../routes/ReefRoutes";
import Form from "../../form";
import theme from "./theme";
import "./App.css";

function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <div id="app">
          <Switch>
            <Route exact path="/" component={HomePage} />
            <Route path="/reefs" component={ReefRoutes} />
            <Route path="/form" component={Form} />
            <Route default component={NotFound} />
          </Switch>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
