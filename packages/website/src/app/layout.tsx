import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { StyledEngineProvider, ThemeProvider } from '@mui/material/styles';
import theme from 'layout/App/theme';
import ClientProviders from './providers';

import '../index.css';
import '../layout/App/App.css';
import 'leaflet/dist/leaflet.css';
import '../assets/css/bootstrap.css';

if (!process.env.NEXT_PUBLIC_WEBSITE_BASE_URL) {
  throw new Error(
    'NEXT_PUBLIC_WEBSITE_BASE_URL environment variable is not defined',
  );
}

export const metadata: Metadata = {
  title: 'Aqualink',
  description: 'Ocean Monitoring',
  metadataBase: new URL(process.env.NEXT_PUBLIC_WEBSITE_BASE_URL),
};

export const viewport: Viewport = {
  themeColor: '#000000',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div id="google_translate_element" />
        <div id="root">
          <AppRouterCacheProvider>
            <StyledEngineProvider injectFirst>
              <ThemeProvider theme={theme}>
                <ClientProviders>{children}</ClientProviders>
              </ThemeProvider>
            </StyledEngineProvider>
          </AppRouterCacheProvider>
        </div>
      </body>
    </html>
  );
}
