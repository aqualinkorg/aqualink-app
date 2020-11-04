import React from "react";
import ReactDOM from "react-dom";
import { AxiosError, AxiosResponse } from "axios";
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
    requestsConfig.agent.interceptors.response.use(
      (response: AxiosResponse) => Promise.resolve(response),
      async (error: AxiosError) => {
        const { config, status } = error?.response || {};
        if (config && status === 401) {
          const token = await user.getIdToken();
          store.dispatch(setToken(token));

          const newConfig = {
            ...config,
            headers: {
              ...config.headers,
              Authorization: `Bearer ${token}`,
            },
          };
          return requestsConfig.agent.request(newConfig);
        }
        return Promise.reject(error);
      }
    );
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
