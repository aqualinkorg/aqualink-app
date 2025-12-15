declare module '*.png';
declare module '*.jpg';
declare module '*.svg';

// Generic CSS import definition
declare module '*.css' {
  interface IClassNames {
    [className: string]: string;
  }

  const classNames: IClassNames;
  export = classNames;
}

declare module 'react-leaflet-cluster';
declare module 'react-swipeable-bottom-sheet';
declare module '@sketchfab/viewer-api';
