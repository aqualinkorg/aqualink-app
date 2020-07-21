import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import "leaflet/dist/leaflet.css";
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";
import App from "./layout/App";
import { store, persistor } from "./store/configure";
import * as serviceWorker from "./serviceWorker";

ReactDOM.render(
  <>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <App />
      </PersistGate>
    </Provider>
  </>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
