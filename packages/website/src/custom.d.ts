declare module '*.png';
declare module '*.jpg';

// Generic CSS import definition
declare module '*.css' {
  interface IClassNames {
    [className: string]: string;
  }

  const classNames: IClassNames;
  export = classNames;
}

declare module 'download-csv' {
  // These types are for our use-case and are in no way representative of the real library
  // Real types: https://github.com/AllenZeng/download-csv#readme
  /* eslint-disable @typescript-eslint/no-unused-vars */
  // eslint-disable-next-line no-inner-declarations
  export default function downloadCSV<K>(
    data: Array<{ [k in K]?: any }>,
    headersMap?: { [k in K]?: string },
    fileName?: string,
  ) {}
  /* eslint-enable @typescript-eslint/no-unused-vars */
}
declare module 'react-leaflet-markercluster';
declare module 'react-swipeable-bottom-sheet';
declare module '@sketchfab/viewer-api';
