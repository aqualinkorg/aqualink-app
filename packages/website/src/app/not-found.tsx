'use client';

import { usePathname } from 'next/navigation';
import NotFound from 'routes/NotFound';
import { DYNAMIC_ROUTES } from './dynamic-routes';

export default function NotFoundPage() {
  const pathname = usePathname();

  // Check if pathname matches any dynamic route, that hasn't been prerendered
  if (pathname) {
    // eslint-disable-next-line no-restricted-syntax
    for (const route of DYNAMIC_ROUTES) {
      const { regex, Component } = route;
      const match = pathname.match(regex);
      if (match) {
        return Component(match);
      }
    }
  }
  return <NotFound />;
}
