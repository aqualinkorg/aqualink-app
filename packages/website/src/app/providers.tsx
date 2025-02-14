'use client';

import { AxiosError } from 'axios';
import { CacheAxiosResponse } from 'axios-cache-interceptor';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import ErrorBoundary from 'layout/App/ErrorBoundary';
import { SnackbarProvider } from 'notistack';
import { useState, useEffect } from 'react';
import { decodeToken } from 'react-jwt';
import { useDispatch, Provider as StoreProvider } from 'react-redux';
import { store } from 'store/configure';
import { getSelf, setToken } from 'store/User/userSlice';
import { useGATagManager } from 'utils/google-analytics';
import app from '../firebase';
import requestsConfig from '../helpers/requests';

function Providers({ children }: { children: React.ReactNode }) {
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

          // Set request interceptor to renew expired token on 401 errors
          requestsConfig.agent().interceptors.response.use(
            (response: CacheAxiosResponse) => Promise.resolve(response),
            async (error: AxiosError) => {
              const { config, status } = error?.response || {};
              const oldToken = store.getState().user.userInfo?.token;
              if (oldToken) {
                const decoded = decodeToken(oldToken) as { exp: number };
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
    setRender(true);
  }, [dispatch]);

  return (
    <SnackbarProvider maxSnack={3}>
      <ErrorBoundary>
        <div id="app">{render && children}</div>
      </ErrorBoundary>
    </SnackbarProvider>
  );
}

export default function ClientProviders({
  children,
}: {
  children: React.ReactNode;
}) {
  // Separate StoreProvider in another component to be able to use redux hooks
  return (
    <StoreProvider store={store}>
      <Providers>{children}</Providers>
    </StoreProvider>
  );
}
