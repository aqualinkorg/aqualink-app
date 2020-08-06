export const coloredBuoy = (color: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="34px" height="40px" viewBox="0 0 29 35" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <title>icon_buoy</title>
      <defs>
          <path d="M10.0023993,-6.25277607e-13 C17.4094117,-6.25277607e-13 22.207967,7.82436546 18.9739831,14.3966715 C17.4094871,17.7347423 12.1924976,22.7424773 10.0023993,25.1417547 C7.70723368,22.5332976 2.80456638,17.9439217 1.13490246,14.5007584 C-2.30725517,8.03253919 2.49117441,-6.25277607e-13 10.0023993,-6.25277607e-13 Z" id="path-1"></path>
          <filter x="-35.0%" y="-19.9%" width="170.0%" height="155.7%" filterUnits="objectBoundingBox" id="filter-2">
              <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
          </filter>
      </defs>
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="Reef-Detail-full---no-live-feed-Copy-2" transform="translate(-792.000000, -491.000000)">
              <g id="icon_buoy" transform="translate(796.938160, 493.500000)">
                  <g id="Fill-1-Copy-2">
                      <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                      <use fill="${color}" fill-rule="evenodd" xlink:href="#path-1"></use>
                  </g>
                  <g id="Group-16" transform="translate(2.500000, 3.812024)" fill="#FFFFFF">
                      <path d="M7.87934229,0.555008568 C8.14664027,0.555008568 8.3685223,0.749949369 8.41022573,1.00555344 L8.41726873,1.09281738 L8.41651139,1.45409175 L10.0877614,1.45506045 L13.7508776,6.11729773 L14.4987182,6.11786428 L14.4987182,7.53624603 L13.2934239,7.53706491 C13.096777,9.96519335 11.0639978,11.8743144 8.58520008,11.8743144 L6.41479992,11.8743144 C3.93600216,11.8743144 1.90322301,9.96519335 1.70657606,7.53706491 L0.501281772,7.53624603 L0.501281772,6.11786428 L1.24809305,6.11729773 L4.91223864,1.45506045 L6.58245928,1.45409175 L6.58273127,1.09281738 C6.58273127,0.82539034 6.7778835,0.603706834 7.03342531,0.562044403 L7.12065771,0.555008568 L7.87934229,0.555008568 Z M5.73561725,2.45487734 L2.8493728,6.11729773 L5.73478,6.11729773 L5.73561725,2.45487734 Z M9.38200826,2.45487734 L9.38154673,6.11729773 L12.3775208,6.11729773 L9.38200826,2.45487734 Z" id="Shape"></path>
                  </g>
              </g>
          </g>
      </g>
  </svg>
  `;
