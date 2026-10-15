import React from 'react';
import { Link } from 'react-router-dom';

export default function PageLink({
  to,
  children,
  className = 'landing-page__text-link',
}: {
  to: string;
  children: React.ReactNode;
  className?: string;
}) {
  return to.startsWith('/') ? (
    <Link className={className} to={to}>
      {children}
    </Link>
  ) : (
    <a className={className} href={to}>
      {children}
    </a>
  );
}
