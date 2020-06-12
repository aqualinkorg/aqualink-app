import React from "react";
import { Switch, Route } from "react-router-dom";

import Reef from "./Reef";
import ReefsList from "./ReefsList";

const ReefRoutes = () => (
  <Switch>
    <Route exact path="/reefs" component={ReefsList} />
    <Route exact path="/reefs/:id" component={Reef} />
  </Switch>
);

export default ReefRoutes;
