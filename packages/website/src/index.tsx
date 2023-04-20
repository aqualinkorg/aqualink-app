import React from 'react';
import ReactDOM from 'react-dom';
import { AxiosError, AxiosResponse } from 'axios';
import './index.css';
import 'leaflet/dist/leaflet.css';
import './assets/css/bootstrap.css';
import jwt from 'jsonwebtoken';
import { Provider } from 'react-redux';
import { SnackbarProvider } from 'notistack';
import App from './layout/App';
import { store } from './store/configure';
import * as serviceWorker from './serviceWorker';
import requestsConfig from './helpers/requests';
import app from './firebase';
import { setToken } from './store/User/userSlice';
import { initGA } from './utils/google-analytics';

if (app) {
  app.auth().onAuthStateChanged((user) => {
    if (user) {
      requestsConfig.agent().interceptors.response.use(
        (response: AxiosResponse) => Promise.resolve(response),
        async (error: AxiosError) => {
          const { config, status } = error?.response || {};
          const oldToken = store.getState().user.userInfo?.token;
          if (oldToken) {
            const decoded = jwt.decode(oldToken) as { exp: number };
            const now = new Date().getTime();
            if (config && status === 401 && decoded.exp < now) {
              // 401 - Unauthorized eror was due to an expired token, renew it.
              const newToken = await user.getIdToken();
              store.dispatch(setToken(newToken));
              const newConfig = {
                ...config,
                headers: {
                  ...config.headers,
                  Authorization: `Bearer ${newToken}`,
                },
              };
              return requestsConfig.agent().request(newConfig);
            }
            return Promise.reject(error);
          }
          return Promise.reject(error);
        },
      );
    }
  });
}

initGA();

ReactDOM.render(
  <>
    <Provider store={store}>
      <SnackbarProvider maxSnack={3}>
        <App />
      </SnackbarProvider>
    </Provider>
  </>,
  document.getElementById('root'),
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
