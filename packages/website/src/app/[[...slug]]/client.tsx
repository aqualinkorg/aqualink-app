'use client';

import dynamic from 'next/dynamic';

const App = dynamic(
  () => import('../../layout/App').then((m) => m.AppProviders),
  { ssr: false },
);

export function ClientOnly() {
  return <App />;
}
