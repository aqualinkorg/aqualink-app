import L from "leaflet";
import {
  dhwColorFinder,
  degreeHeatingWeeksCalculator,
} from "../../../helpers/degreeHeatingWeeks";

export const coloredBuoy = (color: string) =>
  `<?xml version="1.0" encoding="UTF-8"?>
  <svg width="29px" height="35px" viewBox="0 0 29 35" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <defs>
          <path d="M10.0023993,-6.25277607e-13 C17.4094117,-6.25277607e-13 22.207967,7.82436546 18.9739831,14.3966715 C17.4094871,17.7347423 12.1924976,22.7424773 10.0023993,25.1417547 C7.70723368,22.5332976 2.80456638,17.9439217 1.13490246,14.5007584 C-2.30725517,8.03253919 2.49117441,-6.25277607e-13 10.0023993,-6.25277607e-13 Z" id="path-1"></path>
          <filter x="-35.0%" y="-19.9%" width="170.0%" height="155.7%" filterUnits="objectBoundingBox" id="filter-2">
              <feOffset dx="0" dy="2" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
              <feGaussianBlur stdDeviation="2" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
              <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
          </filter>
      </defs>
      <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="Reef-Detail-full---no-live-feed-Copy-2" transform="translate(-748.000000, -491.000000)">
              <g id="icon_sat" transform="translate(752.500000, 493.500000)">
                  <g id="Fill-1">
                      <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
                      <use fill="${color}" fill-rule="evenodd" xlink:href="#path-1"></use>
                  </g>
                  <path d="M15.2680598,9.87791599 C11.5105654,13.6354103 6.18310234,8.31883808 9.9461188,4.555975 L12.1649364,6.77540616 L12.1649364,6.41409093 C12.8785627,6.41409093 13.4591827,6.99710385 13.4591827,7.7107302 L13.0996622,7.70953221 L15.2680598,9.87791599 Z M16.5730897,7.82384158 C16.5736894,5.33842841 14.5375756,3.3 12.0515489,3.3 L12.0515489,4.19818779 C14.0402783,4.19818779 15.6772794,5.83150751 15.6772794,7.82085043 L16.5730897,7.82324642 L16.5730897,7.82384158 Z M15.0787125,7.78729129 C15.0787125,6.1436943 13.7305335,4.79553061 12.0869518,4.79553061 L12.0869518,5.69431663 C13.2361966,5.69431663 14.1799878,6.63803121 14.1799878,7.78735265 L15.0787125,7.78729129 Z M14.2254993,14.820015 L13.1571229,15.8883607 C12.6082704,16.4372131 11.7100826,16.4372131 11.1611841,15.8883607 L9.19592376,13.9231004 L11.2625763,11.8564478 L14.2254993,14.8193708 L14.2254993,14.820015 Z M4.90689491,5.50141065 L3.8385495,6.56978704 C3.28969701,7.11863953 3.28969701,8.01682732 3.8385495,8.56572583 L5.80380954,10.5309862 L7.87046211,8.46433361 L4.90753915,5.50141065 L4.90689491,5.50141065 Z M7.7537,13.1817868 L6.98793566,13.9475511 C6.76803266,14.1668559 6.40912568,14.1668559 6.18922268,13.9475511 L5.77877594,13.5371044 C5.55947117,13.3172014 5.55947117,12.9582944 5.77877594,12.7383914 L6.54454028,11.9726271 C6.58228856,12.0427319 6.63082337,12.1086429 6.68954343,12.1673584 L7.55837196,13.0361869 C7.61709201,13.094907 7.68300309,13.1434418 7.75250507,13.1811901 L7.7537,13.1817868 Z M10.5345618,11.2584025 L9.13185186,12.6610971 C8.80230414,12.9906448 8.26362156,12.9906448 7.93407384,12.6610971 L7.06524531,11.7922685 C6.73569759,11.4627208 6.73569759,10.9240382 7.06524531,10.5944905 L8.50748441,9.15225143 C8.86340024,10.0426469 9.65732738,10.8653351 10.5345618,11.2578656 L10.5345618,11.2584025 Z" id="Fill-1" fill="#FFFFFF" transform="translate(10.000000, 9.800000) scale(-1, -1) translate(-10.000000, -9.800000) "></path>
              </g>
          </g>
      </g>
  </svg>`;

export const coloredBuoyIcon = (degreeHeatingDays: number) => {
  const color = dhwColorFinder(degreeHeatingWeeksCalculator(degreeHeatingDays));
  return L.divIcon({
    iconSize: [24, 24],
    iconAnchor: [12, 28],
    popupAnchor: [3, -24],
    html: `${coloredBuoy(color)}`,
    className: "marker-icon",
  });
};
