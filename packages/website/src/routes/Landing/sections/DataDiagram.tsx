import React from 'react';

export default function DataDiagram({ type }: { type: string }) {
  return (
    <svg
      className="landing-page__diagram"
      viewBox="0 0 360 128"
      aria-hidden="true"
      focusable="false"
    >
      {type === 'satellite' && (
        <g transform="rotate(-25 180 64)">
          <rect x="158" y="42" width="44" height="44" rx="5" />
          <rect x="86" y="48" width="60" height="32" />
          <rect x="214" y="48" width="60" height="32" />
          <path d="M146 64h12m44 0h12M106 48v32m20-32v32m108-32v32m20-32v32M86 64h60m68 0h60M180 86v10m-15 0q15 22 30 0zM180 42V30m-5 0h10" />
        </g>
      )}
      {type === 'sensors' && (
        <g>
          <path d="m54 106 34-21 30 5 29-37 31 22 28-15 30-40 58 14" />
          <circle cx="236" cy="20" r="4" />
        </g>
      )}
      {type === 'surveys' && (
        <g className="landing-page__survey-grid">
          {[0, 1, 2].map((column) =>
            [0, 1].map((row) => (
              <rect
                key={`${column}-${row}`}
                x={80 + column * 68}
                y={20 + row * 48}
                width="60"
                height="40"
              />
            )),
          )}
          <path d="M80 92h196" />
        </g>
      )}
    </svg>
  );
}
