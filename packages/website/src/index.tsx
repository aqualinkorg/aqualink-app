import React from "react";
import ReactDOM from "react-dom";
import { AxiosRequestConfig } from "axios";
import "./index.css";
import "leaflet/dist/leaflet.css";
import "./assets/css/bootstrap.css";
import { Provider } from "react-redux";
import App from "./layout/App";
import { store } from "./store/configure";
import * as serviceWorker from "./serviceWorker";
import requestsConfig from "./helpers/requests";
import app from "./firebase";
import { setToken } from "./store/User/userSlice";

app.auth().onAuthStateChanged((user) => {
  if (user) {
    user.getIdToken().then((token) => {
      requestsConfig.agent.interceptors.request.use(
        (config: AxiosRequestConfig) => {
          store.dispatch(setToken(token));
          return {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            },
          };
        }
      );
    });
  }
});

ReactDOM.render(
  <>
    <Provider store={store}>
      <App />
    </Provider>
  </>,
  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
