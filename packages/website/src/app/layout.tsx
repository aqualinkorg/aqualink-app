import * as React from 'react';
import type { Metadata, Viewport } from 'next';
import '../index.css';
import 'leaflet/dist/leaflet.css';
import '../assets/css/bootstrap.css';

export const metadata: Metadata = {
  title: 'Aqualink',
  description: 'Ocean Monitoring',
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
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
