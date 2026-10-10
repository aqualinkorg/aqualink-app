import React from 'react';

export default function DataDiagram({ type }: { type: string }) {
  return (
    <svg
      className="landing-page__diagram"
      viewBox="0 0 128 128"
      aria-hidden="true"
      focusable="false"
    >
      {type === 'satellite' && (
        <g transform="rotate(-25 64 64)">
          <rect x="52" y="46" width="24" height="32" rx="4" />
          <rect x="14" y="50" width="30" height="24" />
          <rect x="84" y="50" width="30" height="24" />
          <path d="M44 62h8m24 0h8M24 50v24m10-24v24m60-24v24m10-24v24M14 62h30m40 0h30M64 78v8m-10 0q10 16 20 0zM64 46V36m-4 0h8" />
        </g>
      )}
      {type === 'sensors' && (
        <g>
          <path d="m16 90 16-12 14 4 14-24 15 14 14-9 14-25 13 5" />
          <circle
            className="landing-page__diagram-dot"
            cx="103"
            cy="38"
            r="3"
          />
        </g>
      )}
      {type === 'surveys' && (
        <g>
          <path d="M28 44h18l6-10h24l6 10h18a6 6 0 0 1 6 6v38a6 6 0 0 1-6 6H28a6 6 0 0 1-6-6V50a6 6 0 0 1 6-6z" />
          <circle cx="64" cy="68" r="18" />
          <circle cx="64" cy="68" r="12" />
          <path d="M88 54h8" />
        </g>
      )}
    </svg>
  );
}
